import { Router } from "express";
import { activityRequestDtoValidator } from "../middlewares/validators/activityValidators";
import ActivityService from "../services/implementations/activityService";
import {
  ActivityResponseDTO,
  IActivityService,
} from "../services/interfaces/activityService";
import {
  getErrorMessage,
  NotFoundError,
  INTERNAL_SERVER_ERROR_MESSAGE,
} from "../utilities/errorUtils";
import { sendResponseByMimeType } from "../utilities/responseUtil";

const activityRouter: Router = Router();

const activityService: IActivityService = new ActivityService();

/* Create Activity */
activityRouter.post("/", activityRequestDtoValidator, async (req, res) => {
  try {
    const { body } = req;
    const newActivity = await activityService.createActivity({
      activityName: body.activityName,
    });
    res.status(201).json(newActivity);
  } catch (e: unknown) {
    if (e instanceof NotFoundError) {
      res.status(404).send(getErrorMessage(e));
    } else {
      res.status(500).send(INTERNAL_SERVER_ERROR_MESSAGE);
    }
  }
});

/* Get all Activities */
activityRouter.get("/", async (req, res) => {
  const contentType = req.headers["content-type"];
  try {
    const activities = await activityService.getActivities();
    await sendResponseByMimeType<ActivityResponseDTO>(
      res,
      200,
      contentType,
      activities,
    );
  } catch (e: unknown) {
    await sendResponseByMimeType(res, 500, contentType, [
      {
        error: INTERNAL_SERVER_ERROR_MESSAGE,
      },
    ]);
  }
});

/* Get Activity by id */
activityRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const activity = await activityService.getActivity(id);
    res.status(200).json(activity);
  } catch (e: unknown) {
    if (e instanceof NotFoundError) {
      res.status(404).send(getErrorMessage(e));
    } else {
      res.status(500).send(INTERNAL_SERVER_ERROR_MESSAGE);
    }
  }
});

/* Update Activity by id */
activityRouter.put("/:id", activityRequestDtoValidator, async (req, res) => {
  const { id } = req.params;
  try {
    const { body } = req;
    const activity = await activityService.updateActivity(id, {
      activityName: body.activityName,
    });
    res.status(200).json(activity);
  } catch (e: unknown) {
    if (e instanceof NotFoundError) {
      res.status(404).send(getErrorMessage(e));
    } else {
      res.status(500).send(INTERNAL_SERVER_ERROR_MESSAGE);
    }
  }
});

/* Delete Activity by id */
activityRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedId = await activityService.deleteActivity(id);
    res.status(200).json({ id: deletedId });
  } catch (e: unknown) {
    if (e instanceof NotFoundError) {
      res.status(404).send(getErrorMessage(e));
    } else {
      res.status(500).send(INTERNAL_SERVER_ERROR_MESSAGE);
    }
  }
});

export default activityRouter;
