import { Router } from "express";
import { isAuthorizedByRole } from "../middlewares/auth";
import {
  taskRequestDtoValidator,
  taskUpdateDtoValidator,
  taskUserPatchValidator,
  taskScheduledTimePatchValidator,
  taskStartTimePatchValidator,
  taskEndTimePatchValidator,
  taskNotesPatchValidator,
} from "../middlewares/validators/taskValidators";
import TaskService from "../services/implementations/taskService";
import {
  TaskResponseDTO,
  ITaskService,
} from "../services/interfaces/taskService";
import { getErrorMessage, NotFoundError } from "../utilities/errorUtils";
import { sendResponseByMimeType } from "../utilities/responseUtil";
import { Role } from "../types";
import { logInteraction } from "../middlewares/logInteraction";



const taskRouter: Router = Router();
taskRouter.use(isAuthorizedByRole(new Set(Object.values(Role))));
const taskService: ITaskService = new TaskService();

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

/* Get Task by id */
taskRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const task = await taskService.getTask(id);
    res.status(200).json(task);
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

/* Updates/Sets User assigned to an Task */
taskRouter.patch(
  "/:id/assign-user",
  isAuthorizedByRole(new Set([Role.ANIMAL_BEHAVIOURIST, Role.ADMINISTRATOR])),
  taskUserPatchValidator,
  async (req, res) => {
    const { id } = req.params;
    try {
      const { body } = req;
      const Task = await taskService.assignUser(id, {
        userId: body.userId,
      });
      await logInteraction(req, res);
      res.status(200).json(Task);
    } catch (e: unknown) {
      res.status(500).send(getErrorMessage(e));
    }
  },
);


// TO DO - MUST RENAME TO START DATE
/* Updates/Sets a scheduled start time to an Task */
taskRouter.patch(
  "/:id/schedule",
  isAuthorizedByRole(new Set([Role.ANIMAL_BEHAVIOURIST, Role.ADMINISTRATOR])),
  taskScheduledTimePatchValidator,
  async (req, res) => {
    const { id } = req.params;
    try {
      const { body } = req;
      const Task = await taskService.scheduleTask(id, {
        time: body.scheduledStartTime,
      });
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
      await logInteraction(req, res);
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
    await logInteraction(req, res);
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
    await logInteraction(req, res);
    res.status(200).json(Task);
  } catch (e: unknown) {
    res.status(500).send(getErrorMessage(e));
  }
});

/* Delete Task by id */
taskRouter.delete(
  "/:id",
  isAuthorizedByRole(new Set([Role.ANIMAL_BEHAVIOURIST, Role.ADMINISTRATOR])),
  async (req, res) => {
    const { id } = req.params;

    try {
      const deletedId = await taskService.deleteTask(id);
      await logInteraction(req, res);
      res.status(200).json({ id: deletedId });
    } catch (e: unknown) {
      res.status(500).send(getErrorMessage(e));
    }
  },
);




export default taskRouter;
