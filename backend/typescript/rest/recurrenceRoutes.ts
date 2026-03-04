import { Router } from "express";
import { isAuthorizedByRole } from "../middlewares/auth";
import {
  createRecurringTaskValidator,
  addRecurrenceToTaskValidator,
} from "../middlewares/validators/recurrenceValidators";
import RecurrenceService from "../services/implementations/recurrenceService";
import { IRecurrenceService } from "../services/interfaces/recurrenceService";
import {
  getErrorMessage,
  NotFoundError,
  ConflictError,
} from "../utilities/errorUtils";
import { Role } from "../types";

const recurrenceRouter: Router = Router();
recurrenceRouter.use(isAuthorizedByRole(new Set(Object.values(Role))));
const recurrenceService: IRecurrenceService = new RecurrenceService();

/* Create a new recurring task */
recurrenceRouter.post(
  "/",
  isAuthorizedByRole(new Set([Role.ANIMAL_BEHAVIOURIST, Role.ADMINISTRATOR])),
  createRecurringTaskValidator,
  async (req, res) => {
    try {
      const { body } = req;
      const newRecurringTask = await recurrenceService.createRecurringTask({
        task: {
          userId: body.task.userId,
          petId: body.task.petId,
          taskTemplateId: body.task.taskTemplateId,
          scheduledStartTime: body.task.scheduledStartTime,
          startTime: body.task.startTime,
          endTime: body.task.endTime,
          notes: body.task.notes,
        },
        recurrence: {
          days: body.recurrence.days,
          cadence: body.recurrence.cadence,
          endDate: body.recurrence.endDate,
          exclusions: body.recurrence.exclusions,
        },
      });
      res.status(201).json(newRecurringTask);
    } catch (error: unknown) {
      res.status(500).send(getErrorMessage(error));
    }
  },
);

/* Add recurrence to an existing task */
recurrenceRouter.post(
  "/:task_id",
  isAuthorizedByRole(new Set([Role.ANIMAL_BEHAVIOURIST, Role.ADMINISTRATOR])),
  addRecurrenceToTaskValidator,
  async (req, res) => {
    const { task_id } = req.params;
    try {
      const { body } = req;
      const recurringTask = await recurrenceService.addRecurrenceToTask(
        task_id,
        {
          task: body.task
            ? {
                userId: body.task.userId,
                petId: body.task.petId,
                taskTemplateId: body.task.taskTemplateId,
                scheduledStartTime: body.task.scheduledStartTime,
                startTime: body.task.startTime,
                endTime: body.task.endTime,
                notes: body.task.notes,
              }
            : undefined,
          recurrence: {
            days: body.recurrence.days,
            cadence: body.recurrence.cadence,
            endDate: body.recurrence.endDate,
            exclusions: body.recurrence.exclusions,
          },
        },
      );
      res.status(201).json(recurringTask);
    } catch (e: unknown) {
      if (e instanceof NotFoundError) {
        res.status(404).send(getErrorMessage(e));
      } else if (e instanceof ConflictError) {
        res.status(409).send(getErrorMessage(e));
      } else {
        res.status(500).send(getErrorMessage(e));
      }
    }
  },
);

export default recurrenceRouter;
