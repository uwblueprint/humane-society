import { Router } from "express";
import { taskTemplateRequestDtoValidator } from "../middlewares/validators/taskTemplateValidators";
import TaskTemplateService from "../services/implementations/taskTemplateService";
import {
  TaskTemplateResponseDTO,
  ITaskTemplateService,
} from "../services/interfaces/taskTemplateService";
import {
  getErrorMessage,
  NotFoundError,
  INTERNAL_SERVER_ERROR_MESSAGE,
} from "../utilities/errorUtils";
import { sendResponseByMimeType } from "../utilities/responseUtil";

const taskTemplateRouter: Router = Router();

const taskTemplateService: ITaskTemplateService = new TaskTemplateService();

/* Create TaskTemplate */
taskTemplateRouter.post(
  "/",
  taskTemplateRequestDtoValidator,
  async (req, res) => {
    try {
      const { body } = req;
      const newTaskTemplate = await taskTemplateService.createTaskTemplate({
        taskName: body.taskName,
      });
      res.status(201).json(newTaskTemplate);
    } catch (e: unknown) {
      if (e instanceof NotFoundError) {
        res.status(404).send(getErrorMessage(e));
      } else {
        res.status(500).send(INTERNAL_SERVER_ERROR_MESSAGE);
      }
    }
  },
);

/* Get all TaskTemplates */
taskTemplateRouter.get("/", async (req, res) => {
  const contentType = req.headers["content-type"];
  try {
    const taskTemplates = await taskTemplateService.getTaskTemplates();
    await sendResponseByMimeType<TaskTemplateResponseDTO>(
      res,
      200,
      contentType,
      taskTemplates,
    );
  } catch (e: unknown) {
    await sendResponseByMimeType(res, 500, contentType, [
      {
        error: INTERNAL_SERVER_ERROR_MESSAGE,
      },
    ]);
  }
});

/* Get TaskTemplate by id */
taskTemplateRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const taskTemplate = await taskTemplateService.getTaskTemplate(id);
    res.status(200).json(taskTemplate);
  } catch (e: unknown) {
    if (e instanceof NotFoundError) {
      res.status(404).send(getErrorMessage(e));
    } else {
      res.status(500).send(INTERNAL_SERVER_ERROR_MESSAGE);
    }
  }
});

/* Update TaskTemplate by id */
taskTemplateRouter.put(
  "/:id",
  taskTemplateRequestDtoValidator,
  async (req, res) => {
    const { id } = req.params;
    try {
      const { body } = req;
      const taskTemplate = await taskTemplateService.updateTaskTemplate(id, {
        taskName: body.taskName,
      });
      res.status(200).json(taskTemplate);
    } catch (e: unknown) {
      if (e instanceof NotFoundError) {
        res.status(404).send(getErrorMessage(e));
      } else {
        res.status(500).send(INTERNAL_SERVER_ERROR_MESSAGE);
      }
    }
  },
);

/* Delete TaskTemplate by id */
taskTemplateRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedId = await taskTemplateService.deleteTaskTemplate(id);
    res.status(200).json({ id: deletedId });
  } catch (e: unknown) {
    if (e instanceof NotFoundError) {
      res.status(404).send(getErrorMessage(e));
    } else {
      res.status(500).send(INTERNAL_SERVER_ERROR_MESSAGE);
    }
  }
});

export default taskTemplateRouter;
