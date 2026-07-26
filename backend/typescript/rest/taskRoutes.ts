import { Router, Request } from "express";
import {
  isAuthorizedByRole,
  isAuthorizedToAssignTask,
  getAccessToken,
} from "../middlewares/auth";
import {
  taskRequestDtoValidator,
  taskUpdateDtoValidator,
  taskUserPatchValidator,
  taskScheduledTimePatchValidator,
  taskStartTimePatchValidator,
  taskEndTimePatchValidator,
  taskNotesPatchValidator,
  taskGetByDateValidator,
} from "../middlewares/validators/taskValidators";
import TaskService from "../services/implementations/taskService";
import PetService from "../services/implementations/petService";
import TaskTemplateService from "../services/implementations/taskTemplateService";
import AuthService from "../services/implementations/authService";
import UserService from "../services/implementations/userService";
import InteractionService from "../services/implementations/interactionService";
import IAuthService from "../services/interfaces/authService";
import IUserService from "../services/interfaces/userService";
import {
  TaskResponseDTO,
  RecurrenceTaskDTO,
  ITaskService,
} from "../services/interfaces/taskService";
import { IPetService } from "../services/interfaces/petService";
import { ITaskTemplateService } from "../services/interfaces/taskTemplateService";
import {
  BadRequestError,
  getErrorMessage,
  NotFoundError,
} from "../utilities/errorUtils";
import { sendResponseByMimeType } from "../utilities/responseUtil";
import {
  validateEnum,
  validateEnumArray,
} from "../middlewares/validators/util";
import { Role, Days, Cadence, InteractionTypeEnum } from "../types";
import logInteraction from "../middlewares/logInteraction";
import {
  buildStartDates,
  isDateInRecurrence,
  resetDateToUTCMidnight,
} from "../utilities/dateUtils";

const taskRouter: Router = Router();
taskRouter.use(isAuthorizedByRole(new Set(Object.values(Role))));
const taskService: ITaskService = new TaskService();
const petService: IPetService = new PetService();
const taskTemplateService: ITaskTemplateService = new TaskTemplateService();
const userService: IUserService = new UserService();
const authService: IAuthService = new AuthService(userService);

const DAY_LABELS: Record<string, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

const formatDaysForLog = (days?: Days[] | null): string =>
  days && days.length > 0
    ? days.map((d) => DAY_LABELS[d] ?? d).join(", ")
    : "no days";

const formatRecurrenceDateForLog = (date?: Date | string | null): string => {
  if (!date) return "indefinite";
  const d = new Date(date);
  return `${String(d.getUTCMonth() + 1).padStart(2, "0")}/${String(
    d.getUTCDate(),
  ).padStart(2, "0")}/${d.getUTCFullYear()}`;
};

const sameDays = (a?: Days[] | null, b?: Days[] | null): boolean =>
  [...(a ?? [])].sort().join(",") === [...(b ?? [])].sort().join(",");

// Prevents two near-simultaneous requests for the same task from both
// passing the "not logged yet" check before either finishes writing.
const incompleteCheckInFlight = new Set<number>();

const maybeLogIncompleteTask = async (
  task: TaskResponseDTO,
  req: Request,
): Promise<void> => {
  if (incompleteCheckInFlight.has(task.id)) return;
  incompleteCheckInFlight.add(task.id);
  try {
    if (!task.scheduledStartTime || task.endTime) return;
    if (
      resetDateToUTCMidnight(task.scheduledStartTime).getTime() >=
      resetDateToUTCMidnight(new Date()).getTime()
    ) {
      return;
    }

    const alreadyLogged = await InteractionService.hasTaskInteraction(
      task.id,
      InteractionTypeEnum.MARKED_TASK_INCOMPLETE,
    );
    if (alreadyLogged) return;

    const accessToken = getAccessToken(req);
    if (!accessToken) return;
    const actorId = Number(await authService.getUserIdByToken(accessToken));

    const [pet, template, assignee] = await Promise.all([
      petService.getPet(String(task.petId)),
      taskTemplateService.getTaskTemplate(String(task.taskTemplateId)),
      task.userId ? userService.getUserById(String(task.userId)) : null,
    ]);

    req.body = {
      actorId,
      targetId: task.id,
      interactionType: InteractionTypeEnum.MARKED_TASK_INCOMPLETE,
      taskTemplateName: template.taskName,
      petName: pet.name,
      oldUserName: assignee
        ? `${assignee.firstName} ${assignee.lastName}`
        : undefined,
    };
    await logInteraction(req);
  } catch (err: unknown) {
    // eslint-disable-next-line no-console
    console.error("Failed to log incomplete task:", err);
  } finally {
    incompleteCheckInFlight.delete(task.id);
  }
};

// Logs ASSIGNED_TASK / SELF_ASSIGNED_TASK when a task is created with an
// assignee already picked, since createTask never hits /assign-user.
const logTaskCreationAssignment = async (
  req: Request,
  taskId: number,
  userId: number | null | undefined,
): Promise<void> => {
  if (!userId) return;
  try {
    const accessToken = getAccessToken(req);
    if (!accessToken) return;
    const actorId = Number(await authService.getUserIdByToken(accessToken));

    const [pet, template, assignee] = await Promise.all([
      petService.getPet(String(req.body.petId)),
      taskTemplateService.getTaskTemplate(String(req.body.taskTemplateId)),
      userService.getUserById(String(userId)),
    ]);

    req.body = {
      actorId,
      targetId: taskId,
      interactionType:
        actorId === userId
          ? InteractionTypeEnum.SELF_ASSIGNED_TASK
          : InteractionTypeEnum.ASSIGNED_TASK,
      taskTemplateName: template.taskName,
      petName: pet.name,
      newUserName: `${assignee.firstName} ${assignee.lastName}`,
    };
    await logInteraction(req);
  } catch (err: unknown) {
    // eslint-disable-next-line no-console
    console.error("Failed to log task creation assignment:", err);
  }
};

// Logs one interaction per changed field on a recurring task edit. Used for
// both in-place edits and "this and following" splits — in the split case
// we still log against the original task id, since that's what the user
// perceives themselves as editing even though a new task record is created.
const logRecurrenceEditChanges = async (
  req: Request,
  taskId: string,
  task: TaskResponseDTO,
  recurrence: RecurrenceTaskDTO,
  taskTemplateId: number | undefined,
  notes: string | undefined,
  parsedScheduledStartTime: Date | undefined,
  parsedRecurrenceEndDate: Date | undefined,
  days: Days[] | undefined,
  cadence: Cadence | undefined,
): Promise<void> => {
  try {
    if (!task.scheduledStartTime) return;
    const accessToken = getAccessToken(req);
    if (!accessToken) return;
    const actorId = Number(await authService.getUserIdByToken(accessToken));
    const [pet, template] = await Promise.all([
      petService.getPet(String(task.petId)),
      taskTemplateService.getTaskTemplate(
        String(taskTemplateId ?? task.taskTemplateId),
      ),
    ]);
    const logFields = {
      actorId,
      targetId: Number(taskId),
      taskTemplateName: template.taskName,
      petName: pet.name,
    };
    const originalBody = req.body;

    if (notes !== undefined && notes !== task.notes) {
      req.body = {
        ...logFields,
        interactionType: InteractionTypeEnum.CHANGED_TASK_INSTRUCTIONS,
        oldInstructions: task.notes,
        newInstructions: notes,
      };
      await logInteraction(req);
    }

    if (
      parsedScheduledStartTime !== undefined &&
      parsedScheduledStartTime.getTime() !==
        new Date(task.scheduledStartTime).getTime()
    ) {
      req.body = {
        ...logFields,
        interactionType: InteractionTypeEnum.CHANGED_TASK_START_DATE,
        oldDate: formatRecurrenceDateForLog(task.scheduledStartTime),
        newDate: formatRecurrenceDateForLog(parsedScheduledStartTime),
      };
      await logInteraction(req);
    }

    if (
      parsedRecurrenceEndDate !== undefined &&
      (!recurrence.endDate ||
        new Date(recurrence.endDate).getTime() !==
          parsedRecurrenceEndDate.getTime())
    ) {
      req.body = {
        ...logFields,
        interactionType: InteractionTypeEnum.CHANGED_TASK_END_DATE,
        oldDate: formatRecurrenceDateForLog(recurrence.endDate),
        newDate: formatRecurrenceDateForLog(parsedRecurrenceEndDate),
      };
      await logInteraction(req);
    }

    if (days !== undefined && !sameDays(days, recurrence.days)) {
      req.body = {
        ...logFields,
        interactionType: InteractionTypeEnum.CHANGED_RECURRING_TASK_DAYS,
        oldDays: formatDaysForLog(recurrence.days),
        newDays: formatDaysForLog(days),
      };
      await logInteraction(req);
    }

    if (cadence !== undefined && cadence !== recurrence.cadence) {
      req.body = {
        ...logFields,
        interactionType: InteractionTypeEnum.CHANGED_RECURRING_TASK_CADENCE,
        oldCadence: recurrence.cadence,
        newCadence: cadence,
      };
      await logInteraction(req);
    }

    req.body = originalBody;
  } catch (err: unknown) {
    // eslint-disable-next-line no-console
    console.error("Failed to log recurring task edit:", err);
  }
};

/* Get all Tasks */
taskRouter.get("/", async (req, res) => {
  const contentType = req.headers["content-type"];
  try {
    const tasks = await taskService.getTasks();
    await sendResponseByMimeType<TaskResponseDTO>(res, 200, contentType, tasks);
  } catch (e: unknown) {
    await sendResponseByMimeType(res, 500, contentType, [
      { error: getErrorMessage(e) },
    ]);
  }
});

/* Get Tasks for a specific date */
taskRouter.get("/date", taskGetByDateValidator, async (req, res) => {
  const { date, userId, petId } = req.query;

  try {
    const filters: { userId?: number; petId?: number } = {};

    if (userId !== undefined && userId !== null) {
      filters.userId = Number(userId);
    }

    if (petId !== undefined && petId !== null) {
      filters.petId = Number(petId);
    }

    const tasks = await taskService.getTasksForDate(
      date as string,
      Object.keys(filters).length > 0 ? filters : undefined,
    );

    res.status(200).json(tasks);
  } catch (e: unknown) {
    res.status(500).send(getErrorMessage(e));
  }
});

/* Get Task by id */
taskRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const task = await taskService.getTask(id);
    res.status(200).json(task);
    await maybeLogIncompleteTask(task, req);
  } catch (e: unknown) {
    if (e instanceof NotFoundError) {
      res.status(404).send(getErrorMessage(e));
    } else {
      res.status(500).send(getErrorMessage(e));
    }
  }
});

/* Get Task Recurrence by id */
taskRouter.get("/:id/recurrence", async (req, res) => {
  const { id } = req.params;
  try {
    const recurrence = await taskService.getRecurrence(id);
    res.status(200).json(recurrence);
  } catch (e: unknown) {
    if (e instanceof NotFoundError) {
      res.status(404).send(getErrorMessage(e));
    } else {
      res.status(500).send(getErrorMessage(e));
    }
  }
});

/* Get Tasks for specific Pet by Pet id */
taskRouter.get("/pet/:petId", async (req, res) => {
  const { petId } = req.params;
  try {
    const tasksByPet = await taskService.getPetTasks(petId);
    res.status(200).json(tasksByPet);
  } catch (e: unknown) {
    if (e instanceof NotFoundError) {
      res.status(404).send(getErrorMessage(e));
    } else {
      res.status(500).send(getErrorMessage(e));
    }
  }
});

/* Get Tasks for specific User by User id */
taskRouter.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const tasksByUser = await taskService.getUserTasks(userId);
    res.status(200).json(tasksByUser);
  } catch (e: unknown) {
    if (e instanceof NotFoundError) {
      res.status(404).send(getErrorMessage(e));
    } else {
      res.status(500).send(getErrorMessage(e));
    }
  }
});

/* Create Task */
taskRouter.post(
  "/",
  isAuthorizedByRole(new Set([Role.ANIMAL_BEHAVIOURIST, Role.ADMINISTRATOR])),
  taskRequestDtoValidator,
  async (req, res) => {
    try {
      const { body } = req;
      const newTask = await taskService.createTask({
        userId: body.userId,
        petId: body.petId,
        taskTemplateId: body.taskTemplateId,
        scheduledStartTime: body.scheduledStartTime,
        scheduledEndTime: body.scheduledEndTime,
        startTime: body.startTime,
        endTime: body.endTime,
        notes: body.notes,
      });
      res.status(201).json(newTask);
      await logTaskCreationAssignment(req, newTask.id, body.userId);
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        res.status(404).send(getErrorMessage(error));
      } else {
        res.status(500).send(getErrorMessage(error));
      }
    }
  },
);

taskRouter.post(
  "/recurrences/:taskId/edit",
  isAuthorizedByRole(new Set([Role.ANIMAL_BEHAVIOURIST, Role.ADMINISTRATOR])),
  async (req, res) => {
    const { taskId } = req.params;

    const date =
      typeof req.query.date === "string" &&
      !Number.isNaN(new Date(req.query.date).getTime())
        ? new Date(req.query.date)
        : undefined;
    const single =
      req.query.single === "true" || req.query.single === "false"
        ? req.query.single === "true"
        : undefined;

    if (date === undefined || single === undefined) {
      res.status(400).send("Invalid query parameters");
      return;
    }

    const {
      notes,
      userId,
      taskTemplateId,
      scheduledStartTime,
      scheduledEndTime,
      days,
      cadence,
      endDate,
    } = req.body;

    let parsedScheduledStartTime: Date | undefined;
    let parsedScheduledEndTime: Date | undefined;
    let parsedRecurrenceEndDate: Date | undefined;

    if (
      (notes !== undefined && typeof notes !== "string") ||
      (userId !== undefined && typeof userId !== "number") ||
      (taskTemplateId !== undefined && typeof taskTemplateId !== "number") ||
      (scheduledStartTime !== undefined &&
        (typeof scheduledStartTime !== "string" ||
          Number.isNaN(new Date(scheduledStartTime).getTime()))) ||
      (scheduledEndTime !== undefined &&
        (typeof scheduledEndTime !== "string" ||
          Number.isNaN(new Date(scheduledEndTime).getTime()))) ||
      (days !== undefined && !validateEnumArray(days, Days)) ||
      (cadence !== undefined && !validateEnum(cadence, Cadence)) ||
      (endDate !== undefined &&
        (typeof endDate !== "string" ||
          Number.isNaN(new Date(endDate).getTime())))
    ) {
      res.status(400).send("Invalid request body");
      return;
    }

    if (scheduledStartTime !== undefined) {
      parsedScheduledStartTime = new Date(scheduledStartTime);
    }

    if (scheduledEndTime !== undefined) {
      parsedScheduledEndTime = new Date(scheduledEndTime);
    }

    if (endDate !== undefined) {
      parsedRecurrenceEndDate = new Date(endDate);
    }

    try {
      const task = await taskService.getTask(taskId);
      const recurrence = await taskService.getRecurrence(taskId);

      if (!task.scheduledStartTime) {
        throw new NotFoundError("Given task has no start date");
      }

      const isSeedDate =
        resetDateToUTCMidnight(task.scheduledStartTime).getTime() ===
        resetDateToUTCMidnight(date).getTime();

      const actualStart = resetDateToUTCMidnight(task.scheduledStartTime);
      const startDates =
        recurrence.days && recurrence.days.length > 0
          ? buildStartDates(actualStart, recurrence.days)
          : [actualStart];
      const matchesPattern = startDates.some((startDate) =>
        isDateInRecurrence(startDate, date, recurrence.cadence),
      );
      if (!isSeedDate && !matchesPattern) {
        throw new BadRequestError(
          "Given date doesn't follow the recurrence rule",
        );
      }

      if (
        recurrence.endDate &&
        resetDateToUTCMidnight(date).getTime() >
          resetDateToUTCMidnight(recurrence.endDate).getTime()
      ) {
        throw new BadRequestError(
          "Given date is after the recurrence's end date",
        );
      }

      const newScheduledStartTime =
        parsedScheduledStartTime !== undefined
          ? parsedScheduledStartTime
          : date;

      let newScheduledEndTime = parsedScheduledEndTime;
      if (newScheduledEndTime === undefined && task.scheduledEndTime) {
        const seedEnd = new Date(task.scheduledEndTime);
        newScheduledEndTime = new Date(newScheduledStartTime);
        newScheduledEndTime.setUTCHours(
          seedEnd.getUTCHours(),
          seedEnd.getUTCMinutes(),
          seedEnd.getUTCSeconds(),
          seedEnd.getUTCMilliseconds(),
        );
      }

      if (
        newScheduledEndTime !== undefined &&
        newScheduledEndTime <= newScheduledStartTime
      ) {
        throw new BadRequestError(
          "scheduledEndTime must be after scheduledStartTime",
        );
      }

      if (single) {
        await taskService.excludeDate(taskId, date);
        const singleTask = await taskService.createTask({
          userId: userId ?? task.userId,
          petId: task.petId,
          taskTemplateId: taskTemplateId ?? task.taskTemplateId,
          scheduledStartTime: newScheduledStartTime,
          scheduledEndTime: newScheduledEndTime,
          startTime: task.startTime,
          endTime: task.endTime,
          notes: notes ?? task.notes,
        });
        res.status(200).json({
          singleTask,
        });
      } else if (isSeedDate) {
        // Editing from the seed occurrence
        const updatedTask = await taskService.updateTask(taskId, {
          userId: userId ?? task.userId,
          petId: task.petId,
          taskTemplateId: taskTemplateId ?? task.taskTemplateId,
          scheduledStartTime: newScheduledStartTime,
          scheduledEndTime: newScheduledEndTime,
          startTime: task.startTime,
          endTime: task.endTime,
          notes: notes ?? task.notes,
        });
        const updatedRecurrence = await taskService.updateRecurrence(taskId, {
          ...(cadence !== undefined ? { cadence } : {}),
          ...(days !== undefined ? { days } : {}),
          ...(parsedRecurrenceEndDate !== undefined
            ? { endDate: parsedRecurrenceEndDate }
            : {}),
        });

        await logRecurrenceEditChanges(
          req,
          taskId,
          task,
          recurrence,
          taskTemplateId,
          notes,
          parsedScheduledStartTime,
          parsedRecurrenceEndDate,
          days,
          cadence,
        );

        res.status(200).json({
          task: updatedTask,
          recurrenceTask: updatedRecurrence,
        });
      } else {
        const newEndDate = new Date(
          resetDateToUTCMidnight(date).getTime() - 24 * 60 * 60 * 1000,
        );

        await taskService.updateRecurrence(taskId, {
          endDate: newEndDate,
        });
        const newTask = await taskService.createTask({
          userId: userId ?? task.userId,
          petId: task.petId,
          taskTemplateId: taskTemplateId ?? task.taskTemplateId,
          scheduledStartTime: newScheduledStartTime,
          scheduledEndTime: newScheduledEndTime,
          startTime: task.startTime,
          endTime: task.endTime,
          notes: notes ?? task.notes,
        });

        // Log against the original task id, even though the split below
        // moves the new values onto a freshly-created task/recurrence.
        await logRecurrenceEditChanges(
          req,
          taskId,
          task,
          recurrence,
          taskTemplateId,
          notes,
          parsedScheduledStartTime,
          parsedRecurrenceEndDate,
          days,
          cadence,
        );

        const carriedExclusions = (recurrence.exclusions ?? []).filter(
          (ex) =>
            resetDateToUTCMidnight(new Date(ex)).getTime() >
            resetDateToUTCMidnight(newScheduledStartTime).getTime(),
        );
        const newRecurrence = await taskService.createRecurrence(
          newTask.id.toString(),
          cadence ?? recurrence.cadence,
          days ?? recurrence.days,
          parsedRecurrenceEndDate ?? recurrence.endDate,
          carriedExclusions,
        );
        res.status(200).json({
          task: newTask,
          recurrenceTask: newRecurrence,
        });
      }
    } catch (e: unknown) {
      if (e instanceof NotFoundError) {
        res.status(404).send(getErrorMessage(e));
        return;
      }
      if (e instanceof BadRequestError) {
        res.status(400).send(getErrorMessage(e));
        return;
      }
      res.status(500).send(getErrorMessage(e));
    }
  },
);

/* Update Task by id */
taskRouter.patch(
  "/:id",
  isAuthorizedByRole(new Set([Role.ANIMAL_BEHAVIOURIST, Role.ADMINISTRATOR])),
  taskUpdateDtoValidator,
  async (req, res) => {
    const { id } = req.params;
    try {
      const { body } = req;
      const Task = await taskService.updateTask(id, {
        userId: body.userId,
        petId: body.petId,
        taskTemplateId: body.taskTemplateId,
        scheduledStartTime: body.scheduledStartTime,
        scheduledEndTime: body.scheduledEndTime,
        startTime: body.startTime,
        endTime: body.endTime,
        notes: body.notes,
      });
      res.status(200).json(Task);
    } catch (e: unknown) {
      res.status(500).send(getErrorMessage(e));
    }
  },
);

/* Updates/Sets User assigned to an Task.
 * Admins/Animal Behaviourists may assign anyone; other roles (e.g. Volunteers)
 * may only self-assign (assignee in body must be their own user id). */
taskRouter.patch(
  "/:id/assign-user",
  isAuthorizedToAssignTask("userId"),
  taskUserPatchValidator,
  async (req, res) => {
    const { id } = req.params;
    try {
      const { body } = req;
      const Task = await taskService.assignUser(id, {
        userId: body.userId,
      });
      await logInteraction(req);
      res.status(200).json(Task);
    } catch (e: unknown) {
      res.status(500).send(getErrorMessage(e));
    }
  },
);

/* Updates/Sets a scheduled start time to an Task */
taskRouter.patch(
  "/:id/start-date",
  isAuthorizedByRole(new Set([Role.ANIMAL_BEHAVIOURIST, Role.ADMINISTRATOR])),
  taskScheduledTimePatchValidator,
  async (req, res) => {
    const { id } = req.params;
    try {
      const { body } = req;
      const Task = await taskService.scheduleTask(id, {
        time: body.scheduledStartTime,
      });
      await logInteraction(req);
      res.status(200).json(Task);
    } catch (e: unknown) {
      res.status(500).send(getErrorMessage(e));
    }
  },
);

/* Adds a start time to an Task */
taskRouter.patch(
  "/:id/start",
  taskStartTimePatchValidator,
  async (req, res) => {
    const { id } = req.params;
    try {
      const { body } = req;
      const Task = await taskService.startTask(id, {
        time: body.startTime,
      });
      await logInteraction(req);
      res.status(200).json(Task);
    } catch (e: unknown) {
      res.status(500).send(getErrorMessage(e));
    }
  },
);

/* Adds an end time to an Task */
taskRouter.patch("/:id/end", taskEndTimePatchValidator, async (req, res) => {
  const { id } = req.params;
  try {
    const { body } = req;
    const Task = await taskService.endTask(id, {
      time: body.endTime,
    });
    await logInteraction(req);
    res.status(200).json(Task);
  } catch (e: unknown) {
    res.status(500).send(getErrorMessage(e));
  }
});

/* Updates/Adds notes to an Task */
taskRouter.patch("/:id/notes", taskNotesPatchValidator, async (req, res) => {
  const { id } = req.params;
  try {
    const { body } = req;
    const Task = await taskService.updateTaskNotes(id, {
      notes: body.notes,
    });
    await logInteraction(req);
    res.status(200).json(Task);
  } catch (e: unknown) {
    res.status(500).send(getErrorMessage(e));
  }
});

/* Delete Recurring Task Instance(s) */
taskRouter.delete(
  "/recurrences/:taskId",
  isAuthorizedByRole(new Set([Role.ANIMAL_BEHAVIOURIST, Role.ADMINISTRATOR])),
  async (req, res) => {
    const { taskId } = req.params;

    const date =
      typeof req.query.date === "string" &&
      !Number.isNaN(new Date(req.query.date).getTime())
        ? resetDateToUTCMidnight(new Date(req.query.date))
        : undefined;
    const single =
      req.query.single === "true" || req.query.single === "false"
        ? req.query.single === "true"
        : undefined;

    if (date === undefined || single === undefined) {
      res.status(400).send("Invalid query parameters");
      return;
    }

    try {
      const task = await taskService.getTask(taskId);
      if (!task.scheduledStartTime)
        throw new NotFoundError("Task scheduled start time not found");

      if (single) {
        const updatedRecurrence = await taskService.excludeDate(taskId, date);
        await logInteraction(req);
        res.status(200).json({
          task,
          recurrenceTask: updatedRecurrence,
        });
      } else if (
        resetDateToUTCMidnight(task.scheduledStartTime).getTime() ===
        resetDateToUTCMidnight(date).getTime()
      ) {
        await taskService.deleteRecurrence(taskId);
        const deletedTaskId = await taskService.deleteTask(taskId);
        await logInteraction(req);
        res.status(200).json({
          deleted: true,
          taskId: deletedTaskId,
        });
      } else {
        const newEndDate = new Date(date.getTime() - 24 * 60 * 60 * 1000);
        const updatedRecurrence = await taskService.updateRecurrence(taskId, {
          endDate: newEndDate,
        });
        await taskService.deleteFutureTasks(
          task.taskTemplateId,
          task.petId,
          date,
          task.id,
        );
        await logInteraction(req);
        res.status(200).json({
          task,
          recurrenceTask: updatedRecurrence,
        });
      }
    } catch (e: unknown) {
      if (e instanceof NotFoundError) {
        res.status(404).send(getErrorMessage(e));
        return;
      }

      if (e instanceof BadRequestError) {
        res.status(400).send(getErrorMessage(e));
        return;
      }

      res.status(500).send(getErrorMessage(e));
    }
  },
);

/* Delete Task by id */
taskRouter.delete(
  "/:id",
  isAuthorizedByRole(new Set([Role.ANIMAL_BEHAVIOURIST, Role.ADMINISTRATOR])),
  async (req, res) => {
    const { id } = req.params;

    try {
      const deletedId = await taskService.deleteTask(id);
      await logInteraction(req);
      res.status(200).json({ id: deletedId });
    } catch (e: unknown) {
      res.status(500).send(getErrorMessage(e));
    }
  },
);

export default taskRouter;
