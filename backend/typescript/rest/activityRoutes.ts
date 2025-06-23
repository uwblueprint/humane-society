import { Router, Request } from "express";
import { isAuthorizedByRole } from "../middlewares/auth";
import {
  activityEndTimePatchValidator,
  activityNotesPatchValidator,
  activityRequestDtoValidator,
  activityScheduledTimePatchValidator,
  activityStartTimePatchValidator,
  activityUpdateDtoValidator,
  activityUserPatchValidator,
} from "../middlewares/validators/activityValidators";
import ActivityService from "../services/implementations/activityService";
import {
  ActivityResponseDTO,
  ActivityTimePatchDTO,
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

/* Get Activities for specific Pet by Pet id */
activityRouter.get("/pet/:petId", async (req, res) => {
  const { petId } = req.params;
  try {
    const activitiesByPet = await activityService.getPetActivities(petId);
    res.status(200).json(activitiesByPet);
  } catch (e: unknown) {
    if (e instanceof NotFoundError) {
      res.status(404).send(getErrorMessage(e));
    } else {
      res.status(500).send(getErrorMessage(e));
    }
  }
});

/* Get Activities for specific User by User id */
activityRouter.get(
  "/user/:userId/:schedule?", // schedule format: YYYY-MM-DD
  async (req: Request<{ userId: string; schedule?: string }>, res) => {
    const { userId, schedule } = req.params;

    let activityDto: ActivityTimePatchDTO | undefined;

    if (schedule) {
      const date = new Date(schedule);
      if (Number.isNaN(date.getTime())) {
        return res.status(400).send("Invalid date.");
      }

      activityDto = { time: date };
    }

    try {
      const activitiesByUser = await activityService.getUserActivities(
        userId,
        activityDto,
      );
      return res.status(200).json(activitiesByUser);
    } catch (e: unknown) {
      if (e instanceof NotFoundError) {
        return res.status(404).send(getErrorMessage(e));
      }
      return res.status(500).send(getErrorMessage(e));
    }
  },
);

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

/* Updates/Sets User assigned to an Activity */
activityRouter.patch(
  "/:id/assign-user",
  isAuthorizedByRole(new Set([Role.ANIMAL_BEHAVIOURIST, Role.ADMINISTRATOR])),
  activityUserPatchValidator,
  async (req, res) => {
    const { id } = req.params;
    try {
      const { body } = req;
      const Activity = await activityService.assignUser(id, {
        userId: body.userId,
      });
      res.status(200).json(Activity);
    } catch (e: unknown) {
      res.status(500).send(getErrorMessage(e));
    }
  },
);

/* Updates/Sets a scheduled start time to an Activity */
activityRouter.patch(
  "/:id/schedule",
  isAuthorizedByRole(new Set([Role.ANIMAL_BEHAVIOURIST, Role.ADMINISTRATOR])),
  activityScheduledTimePatchValidator,
  async (req, res) => {
    const { id } = req.params;
    try {
      const { body } = req;
      const Activity = await activityService.scheduleActivity(id, {
        time: body.scheduledStartTime,
      });
      res.status(200).json(Activity);
    } catch (e: unknown) {
      res.status(500).send(getErrorMessage(e));
    }
  },
);

/* Adds a start time to an Activity */
activityRouter.patch(
  "/:id/start",
  activityStartTimePatchValidator,
  async (req, res) => {
    const { id } = req.params;
    try {
      const { body } = req;
      const Activity = await activityService.startActivity(id, {
        time: body.startTime,
      });
      res.status(200).json(Activity);
    } catch (e: unknown) {
      res.status(500).send(getErrorMessage(e));
    }
  },
);

/* Adds an end time to an Activity */
activityRouter.patch(
  "/:id/end",
  activityEndTimePatchValidator,
  async (req, res) => {
    const { id } = req.params;
    try {
      const { body } = req;
      const Activity = await activityService.endActivity(id, {
        time: body.endTime,
      });
      res.status(200).json(Activity);
    } catch (e: unknown) {
      res.status(500).send(getErrorMessage(e));
    }
  },
);

/* Updates/Adds notes to an Activity */
activityRouter.patch(
  "/:id/notes",
  activityNotesPatchValidator,
  async (req, res) => {
    const { id } = req.params;
    try {
      const { body } = req;
      const Activity = await activityService.updateActivityNotes(id, {
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
