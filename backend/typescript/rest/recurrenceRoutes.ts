import { Router, Request } from "express";
import { isAuthorizedByRole, getAccessToken } from "../middlewares/auth";
import {
  createRecurringTaskValidator,
  addRecurrenceToTaskValidator,
} from "../middlewares/validators/recurrenceValidators";
import RecurrenceService from "../services/implementations/recurrenceService";
import { IRecurrenceService } from "../services/interfaces/recurrenceService";
import PetService from "../services/implementations/petService";
import TaskTemplateService from "../services/implementations/taskTemplateService";
import AuthService from "../services/implementations/authService";
import UserService from "../services/implementations/userService";
import IAuthService from "../services/interfaces/authService";
import { IPetService } from "../services/interfaces/petService";
import { ITaskTemplateService } from "../services/interfaces/taskTemplateService";
import {
  getErrorMessage,
  NotFoundError,
  ConflictError,
} from "../utilities/errorUtils";
import { Role, InteractionTypeEnum } from "../types";
import logInteraction from "../middlewares/logInteraction";

const recurrenceRouter: Router = Router();
recurrenceRouter.use(isAuthorizedByRole(new Set(Object.values(Role))));
const recurrenceService: IRecurrenceService = new RecurrenceService();
const petService: IPetService = new PetService();
const taskTemplateService: ITaskTemplateService = new TaskTemplateService();
const userService = new UserService();
const authService: IAuthService = new AuthService(userService);

// Logs ASSIGNED_TASK / SELF_ASSIGNED_TASK when a recurring task is created
// (or recurrence is added to a task) with an assignee already picked, since
// these routes never go through the /assign-user route.
const logTaskCreationAssignment = async (
  req: Request,
  taskId: number,
  petId: number,
  taskTemplateId: number,
  userId: number | null | undefined,
): Promise<void> => {
  if (!userId) return;
  try {
    const accessToken = getAccessToken(req);
    if (!accessToken) return;
    const actorId = Number(await authService.getUserIdByToken(accessToken));

    const [pet, template, assignee] = await Promise.all([
      petService.getPet(String(petId)),
      taskTemplateService.getTaskTemplate(String(taskTemplateId)),
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
    console.error("Failed to log task creation assignment:", err);
  }
};

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
          scheduledEndTime: body.task.scheduledEndTime,
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
      await logTaskCreationAssignment(
        req,
        newRecurringTask.id,
        body.task.petId,
        body.task.taskTemplateId,
        body.task.userId,
      );
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
    const { task_id: taskId } = req.params;
    try {
      const { body } = req;
      const recurringTask = await recurrenceService.addRecurrenceToTask(
        taskId,
        {
          task: body.task
            ? {
                userId: body.task.userId,
                petId: body.task.petId,
                taskTemplateId: body.task.taskTemplateId,
                scheduledStartTime: body.task.scheduledStartTime,
                scheduledEndTime: body.task.scheduledEndTime,
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
