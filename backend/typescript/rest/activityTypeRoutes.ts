import { Router } from "express";
import { activityTypeRequestDtoValidator } from "../middlewares/validators/activityTypeValidators";
import ActivityTypeService from "../services/implementations/activityTypeService";
import {
  ActivityTypeResponseDTO,
  IActivityTypeService,
} from "../services/interfaces/activityTypeService";
import {
  getErrorMessage,
  NotFoundError,
  INTERNAL_SERVER_ERROR_MESSAGE,
} from "../utilities/errorUtils";
import { sendResponseByMimeType } from "../utilities/responseUtil";

const activityTypeRouter: Router = Router();

const activityTypeService: IActivityTypeService = new ActivityTypeService();

/* Create ActivityType */
activityTypeRouter.post(
  "/",
  activityTypeRequestDtoValidator,
  async (req, res) => {
    try {
      const { body } = req;
      const newActivityType = await activityTypeService.createActivityType({
        activityName: body.activityName,
      });
      res.status(201).json(newActivityType);
    } catch (e: unknown) {
      if (e instanceof NotFoundError) {
        res.status(404).send(getErrorMessage(e));
      } else {
        res.status(500).send(INTERNAL_SERVER_ERROR_MESSAGE);
      }
    }
  },
);

/* Get all ActivityTypes */
activityTypeRouter.get("/", async (req, res) => {
  const contentType = req.headers["content-type"];
  const limit = Number(req.query.limit); //retrieving limit (component) from the database for the page
  const page = Number(req.query.page); // the actual page we ar on. 
  try {
    const activityTypes = await activityTypeService.getActivityTypes(page, limit);
    await sendResponseByMimeType<ActivityTypeResponseDTO>(
      res,
      200,
      contentType,
      activityTypes,
    );
  } catch (e: unknown) {
    await sendResponseByMimeType(res, 500, contentType, [
      {
        error: INTERNAL_SERVER_ERROR_MESSAGE,
      },
    ]);
  }
});

/* Get ActivityType by id */
activityTypeRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const activityType = await activityTypeService.getActivityType(id);
    res.status(200).json(activityType);
  } catch (e: unknown) {
    if (e instanceof NotFoundError) {
      res.status(404).send(getErrorMessage(e));
    } else {
      res.status(500).send(INTERNAL_SERVER_ERROR_MESSAGE);
    }
  }
});

/* Update ActivityType by id */
activityTypeRouter.put(
  "/:id",
  activityTypeRequestDtoValidator,
  async (req, res) => {
    const { id } = req.params;
    try {
      const { body } = req;
      const activityType = await activityTypeService.updateActivityType(id, {
        activityName: body.activityName,
      });
      res.status(200).json(activityType);
    } catch (e: unknown) {
      if (e instanceof NotFoundError) {
        res.status(404).send(getErrorMessage(e));
      } else {
        res.status(500).send(INTERNAL_SERVER_ERROR_MESSAGE);
      }
    }
  },
);

/* Delete ActivityType by id */
activityTypeRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedId = await activityTypeService.deleteActivityType(id);
    res.status(200).json({ id: deletedId });
  } catch (e: unknown) {
    if (e instanceof NotFoundError) {
      res.status(404).send(getErrorMessage(e));
    } else {
      res.status(500).send(INTERNAL_SERVER_ERROR_MESSAGE);
    }
  }
});

export default activityTypeRouter;
