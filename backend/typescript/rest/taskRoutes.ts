import { Router } from "express";
import { Transaction } from "sequelize";
import { sequelize } from "../models";
import {
  isAuthorizedByRole,
  isAuthorizedToAssignTask,
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
import { ITaskService } from "../services/interfaces/taskService";
import {
  BadRequestError,
  getErrorMessage,
  NotFoundError,
} from "../utilities/errorUtils";
import {
  validateEnum,
  validateEnumArray,
} from "../middlewares/validators/util";
import { Role, Days, Cadence } from "../types";
import logInteraction from "../middlewares/logInteraction";
import {
  matchesRecurrenceRule,
  resetDateToUTCMidnight,
} from "../utilities/dateUtils";

const taskRouter: Router = Router();
taskRouter.use(isAuthorizedByRole(new Set(Object.values(Role))));
const taskService: ITaskService = new TaskService();

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
  const occurrenceDate =
    typeof req.query.date === "string" &&
    !Number.isNaN(new Date(req.query.date).getTime())
      ? new Date(req.query.date)
      : undefined;
  try {
    const task = await taskService.getTask(id, occurrenceDate);
    res.status(200).json(task);
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
    let parsedRecurrenceEndDate: Date | null | undefined;

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
        endDate !== null &&
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
      parsedRecurrenceEndDate = endDate === null ? null : new Date(endDate);
    }

    if (
      parsedRecurrenceEndDate &&
      resetDateToUTCMidnight(parsedRecurrenceEndDate).getTime() <
        resetDateToUTCMidnight(new Date()).getTime()
    ) {
      res.status(400).send("Recurrence end date cannot be before today.");
      return;
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
      const matchesPattern = matchesRecurrenceRule(actualStart, date, {
        days: recurrence.days,
        cadence: recurrence.cadence,
        end_date: recurrence.endDate,
        exclusions: recurrence.exclusions,
      });
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

      if (
        !single &&
        resetDateToUTCMidnight(date).getTime() <
          resetDateToUTCMidnight(new Date()).getTime()
      ) {
        throw new BadRequestError(
          "Cannot apply 'this and following' to a past occurrence.",
        );
      }

      const newScheduledStartTime =
        parsedScheduledStartTime !== undefined
          ? parsedScheduledStartTime
          : date;

      if (
        !single &&
        !isSeedDate &&
        resetDateToUTCMidnight(newScheduledStartTime).getTime() <
          resetDateToUTCMidnight(date).getTime()
      ) {
        throw new BadRequestError(
          "The start date cannot be moved earlier than the selected occurrence for 'this and following'.",
        );
      }

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
        const transaction: Transaction = await sequelize.transaction();
        let singleTask;
        try {
          const shadow = await taskService.consumeShadowForOccurrence(
            taskId,
            date,
            transaction,
          );
          await taskService.excludeDate(taskId, date, transaction);
          singleTask = await taskService.createTask(
            {
              userId:
                userId !== undefined
                  ? userId
                  : (shadow ? shadow.userId : task.userId) ?? undefined,
              petId: task.petId,
              taskTemplateId: taskTemplateId ?? task.taskTemplateId,
              scheduledStartTime: newScheduledStartTime,
              scheduledEndTime: newScheduledEndTime,
              startTime:
                (shadow ? shadow.startTime : task.startTime) ?? undefined,
              endTime: (shadow ? shadow.endTime : task.endTime) ?? undefined,
              notes: notes ?? task.notes,
            },
            transaction,
          );
          await transaction.commit();
        } catch (error) {
          await transaction.rollback();
          throw error;
        }
        res.status(200).json({
          singleTask,
        });
      } else if (isSeedDate) {
        // Editing from the seed occurrence
        const transaction: Transaction = await sequelize.transaction();
        let updatedTask;
        let updatedRecurrence;
        let deletedCount = 0;
        try {
          updatedTask = await taskService.updateTask(
            taskId,
            {
              userId: userId ?? task.userId,
              petId: task.petId,
              taskTemplateId: taskTemplateId ?? task.taskTemplateId,
              scheduledStartTime: newScheduledStartTime,
              scheduledEndTime: newScheduledEndTime,
              startTime: task.startTime,
              endTime: task.endTime,
              notes: notes ?? task.notes,
            },
            transaction,
          );
          updatedRecurrence = await taskService.updateRecurrence(
            taskId,
            {
              ...(cadence !== undefined ? { cadence } : {}),
              ...(days !== undefined ? { days } : {}),
              ...(parsedRecurrenceEndDate !== undefined
                ? { endDate: parsedRecurrenceEndDate }
                : {}),
            },
            transaction,
          );
          ({ deletedCount } = await taskService.reconcileShadows(
            taskId,
            newScheduledStartTime,
            {
              days: updatedRecurrence.days,
              cadence: updatedRecurrence.cadence,
              end_date: updatedRecurrence.endDate,
              exclusions: updatedRecurrence.exclusions,
            },
            null,
            null,
            null,
            transaction,
          ));
          await transaction.commit();
        } catch (error) {
          await transaction.rollback();
          throw error;
        }
        res.status(200).json({
          task: updatedTask,
          recurrenceTask: updatedRecurrence,
          deletedShadowCount: deletedCount,
        });
      } else {
        const newEndDate = new Date(
          resetDateToUTCMidnight(date).getTime() - 24 * 60 * 60 * 1000,
        );

        const transaction: Transaction = await sequelize.transaction();
        let newTask;
        let newRecurrence;
        let deletedCount = 0;
        try {
          await taskService.updateRecurrence(
            taskId,
            { endDate: newEndDate },
            transaction,
          );
          newTask = await taskService.createTask(
            {
              userId: userId ?? task.userId,
              petId: task.petId,
              taskTemplateId: taskTemplateId ?? task.taskTemplateId,
              scheduledStartTime: newScheduledStartTime,
              scheduledEndTime: newScheduledEndTime,
              startTime: task.startTime,
              endTime: task.endTime,
              notes: notes ?? task.notes,
            },
            transaction,
          );

          const carriedExclusions = (recurrence.exclusions ?? []).filter(
            (ex) =>
              resetDateToUTCMidnight(new Date(ex)).getTime() >
              resetDateToUTCMidnight(newScheduledStartTime).getTime(),
          );
          const resolvedNewRecurrenceEndDate =
            parsedRecurrenceEndDate !== undefined
              ? parsedRecurrenceEndDate ?? undefined
              : recurrence.endDate ?? undefined;
          newRecurrence = await taskService.createRecurrence(
            newTask.id.toString(),
            cadence ?? recurrence.cadence,
            days ?? recurrence.days,
            resolvedNewRecurrenceEndDate,
            carriedExclusions,
            transaction,
          );
          ({ deletedCount } = await taskService.reconcileShadows(
            taskId,
            actualStart,
            {
              days: recurrence.days,
              cadence: recurrence.cadence,
              end_date: newEndDate,
              exclusions: recurrence.exclusions,
            },
            newTask.id.toString(),
            newScheduledStartTime,
            {
              days: newRecurrence.days,
              cadence: newRecurrence.cadence,
              end_date: newRecurrence.endDate,
              exclusions: newRecurrence.exclusions,
            },
            transaction,
          ));
          await transaction.commit();
        } catch (error) {
          await transaction.rollback();
          throw error;
        }
        res.status(200).json({
          task: newTask,
          recurrenceTask: newRecurrence,
          deletedShadowCount: deletedCount,
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
    const occurrenceDate =
      typeof req.query.date === "string" &&
      !Number.isNaN(new Date(req.query.date).getTime())
        ? new Date(req.query.date)
        : undefined;
    const single =
      req.query.single === "true" || req.query.single === "false"
        ? req.query.single === "true"
        : undefined;
    try {
      const { body } = req;
      const Task = await taskService.assignUser(
        id,
        { userId: body.userId },
        occurrenceDate,
        single,
      );
      await logInteraction(req);
      res.status(200).json(Task);
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
    const occurrenceDate =
      typeof req.query.date === "string" &&
      !Number.isNaN(new Date(req.query.date).getTime())
        ? new Date(req.query.date)
        : undefined;
    try {
      const { body } = req;
      const Task = await taskService.startTask(
        id,
        { time: body.startTime },
        occurrenceDate,
      );
      await logInteraction(req);
      res.status(200).json(Task);
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

/* Adds an end time to an Task */
taskRouter.patch("/:id/end", taskEndTimePatchValidator, async (req, res) => {
  const { id } = req.params;
  const occurrenceDate =
    typeof req.query.date === "string" &&
    !Number.isNaN(new Date(req.query.date).getTime())
      ? new Date(req.query.date)
      : undefined;
  try {
    const { body } = req;
    const Task = await taskService.endTask(
      id,
      { time: body.endTime },
      occurrenceDate,
    );
    await logInteraction(req);
    res.status(200).json(Task);
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
        const transaction: Transaction = await sequelize.transaction();
        let updatedRecurrence;
        try {
          await taskService.consumeShadowForOccurrence(
            taskId,
            date,
            transaction,
          );
          updatedRecurrence = await taskService.excludeDate(
            taskId,
            date,
            transaction,
          );
          await transaction.commit();
        } catch (error) {
          await transaction.rollback();
          throw error;
        }
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
        res.status(200).json({
          deleted: true,
          taskId: deletedTaskId,
        });
      } else {
        const newEndDate = new Date(date.getTime() - 24 * 60 * 60 * 1000);
        const transaction: Transaction = await sequelize.transaction();
        let updatedRecurrence;
        let deletedCount = 0;
        try {
          updatedRecurrence = await taskService.updateRecurrence(
            taskId,
            { endDate: newEndDate },
            transaction,
          );
          await taskService.deleteFutureTasks(
            task.taskTemplateId,
            task.petId,
            date,
            task.id,
            transaction,
          );
          ({ deletedCount } = await taskService.reconcileShadows(
            taskId,
            resetDateToUTCMidnight(task.scheduledStartTime),
            {
              days: updatedRecurrence.days,
              cadence: updatedRecurrence.cadence,
              end_date: updatedRecurrence.endDate,
              exclusions: updatedRecurrence.exclusions,
            },
            null,
            null,
            null,
            transaction,
          ));
          await transaction.commit();
        } catch (error) {
          await transaction.rollback();
          throw error;
        }
        res.status(200).json({
          task,
          recurrenceTask: updatedRecurrence,
          deletedShadowCount: deletedCount,
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
