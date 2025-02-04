import { Router } from "express";
import { isAuthorizedByRole } from "../middlewares/auth";
import {
  activityRequestDtoValidator,
  activityUpdateDtoValidator,
} from "../middlewares/validators/activityValidators";
import ActivityService from "../services/implementations/activityService";
import {
  ActivityResponseDTO,
  IActivityService,
} from "../services/interfaces/activityService";
import { getErrorMessage, NotFoundError } from "../utilities/errorUtils";
import { sendResponseByMimeType } from "../utilities/responseUtil";
import { Role } from "../types";

const activityRouter: Router = Router();
activityRouter.use(isAuthorizedByRole(new Set(Object.values(Role))));
const activityService: IActivityService = new ActivityService();

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
      { error: getErrorMessage(e) },
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
      res.status(500).send(getErrorMessage(e));
    }
  }
});

/* Create Activity */
activityRouter.post(
  "/",
  isAuthorizedByRole(new Set([Role.ANIMAL_BEHAVIOURIST, Role.ADMINISTRATOR])),
  activityRequestDtoValidator,
  async (req, res) => {
    try {
      const { body } = req;
      const newActivity = await activityService.createActivity({
        userId: body.userId,
        petId: body.petId,
        activityTypeId: body.activityTypeId,
        scheduledStartTime: body.scheduledStartTime,
        startTime: body.startTime,
        endTime: body.endTime,
        notes: body.notes,
      });
      res.status(201).json(newActivity);
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        res.status(404).send(getErrorMessage(error));
      } else {
        res.status(500).send(getErrorMessage(error));
      }
    }
  },
);

/* Update Activity by id */
activityRouter.patch(
  "/:id",
  isAuthorizedByRole(new Set([Role.ANIMAL_BEHAVIOURIST, Role.ADMINISTRATOR])),
  activityUpdateDtoValidator,
  async (req, res) => {
    const { id } = req.params;
    try {
      const { body } = req;
      const Activity = await activityService.updateActivity(id, {
        userId: body.userId,
        petId: body.petId,
        activityTypeId: body.activityTypeId,
        scheduledStartTime: body.scheduledStartTime,
        startTime: body.startTime,
        endTime: body.endTime,
        notes: body.notes,
      });
      res.status(200).json(Activity);
    } catch (e: unknown) {
      res.status(500).send(getErrorMessage(e));
    }
  },
);

/* Delete Activity by id */
activityRouter.delete(
  "/:id",
  isAuthorizedByRole(new Set([Role.ANIMAL_BEHAVIOURIST, Role.ADMINISTRATOR])),
  async (req, res) => {
    const { id } = req.params;

    try {
      const deletedId = await activityService.deleteActivity(id);
      res.status(200).json({ id: deletedId });
    } catch (e: unknown) {
      res.status(500).send(getErrorMessage(e));
    }
  },
);

export default activityRouter;
