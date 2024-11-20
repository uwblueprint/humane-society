import { Router } from "express";
import { getAccessToken, isAuthorizedByRole } from "../middlewares/auth";
import { activityRequestDtoValidator } from "../middlewares/validators/activityValidators";
import ActivityService from "../services/implementations/activityService";
import {
    ActivityResponseDTO,
    IActivityService,
} from "../services/interfaces/activityService";
import { getErrorMessage, INTERNAL_SERVER_ERROR_MESSAGE, NotFoundError } from "../utilities/errorUtils";
import { sendResponseByMimeType } from "../utilities/responseUtil";
import { Role } from "../types";

const activityRouter: Router = Router();
// activityRouter.use(isAuthorizedByRole((new Set([Role.ADMINISTRATOR, Role.ANIMAL_BEHAVIOURIST]))));
const activityService: IActivityService = new ActivityService();

/* Get all Activities */
activityRouter.get("/", async (req, res) => {
    const contentType = req.headers["content-type"];
    try {
        const activities = await activityService.getActivities();
        await sendResponseByMimeType<ActivityResponseDTO>(res, 200, contentType, activities);
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
    } catch (error: unknown) {
        if (error instanceof NotFoundError) {
            res.status(404).send(getErrorMessage(error));
        } else {
            res.status(500).send(INTERNAL_SERVER_ERROR_MESSAGE);
        }
    }
});

/* Create Activity */
activityRouter.post(
    "/",
    activityRequestDtoValidator,
    isAuthorizedByRole(new Set([Role.ANIMAL_BEHAVIOURIST, Role.ADMINISTRATOR])),
    async (req, res) => {
        const accessToken = getAccessToken(req);
        if (!accessToken) {
            res.status(404).json({ error: "Access token not found" });
            return;
        }

        try {

            const { body } = req;
            const newActivity = await activityService.createActivity({
                activityId: body.activityId,
                userId: body.userId,
                petId: body.petId,
                activityTypeId: body.activityTypeId,
                scheduledStartTime: body.scheduledStartTime,
                startTime: body.startTime,
                endTime: body.endTime,
                notes: body.notes,
            });
            res.status(201).json(newActivity);
        } catch (e: unknown) {
            res.status(500).send(INTERNAL_SERVER_ERROR_MESSAGE);
        }
    },
);



/* Update Activity by id */
activityRouter.put(
    "/:id",
    isAuthorizedByRole(new Set([Role.ANIMAL_BEHAVIOURIST, Role.ADMINISTRATOR])),
    activityRequestDtoValidator,
    async (req, res) => {
        const { id } = req.params;
        try {
            const { body } = req;
            const Activity = await activityService.updateActivity(id, {
                activityId: body.activityId,
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
    });

export default activityRouter;
