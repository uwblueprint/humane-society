import { Request, Response } from "express";
import { InteractionService } from "../services/implementations/interactionService"; // import service that write logs to DB
import { InteractionTypeEnum } from "../types"; // enum lists all possible interaction types

const USER_INTERACTIONS = new Set<InteractionTypeEnum>([
  InteractionTypeEnum.CHANGED_USER_NAME,
  InteractionTypeEnum.CHANGED_USER_COLOR_LEVEL,
  InteractionTypeEnum.CHANGED_USER_ROLE,
  InteractionTypeEnum.INVITED_USER,
  InteractionTypeEnum.DELETED_USER,
]);

const PET_INTERACTIONS = new Set<InteractionTypeEnum>([
  InteractionTypeEnum.DELETED_PET,
  InteractionTypeEnum.CHANGED_PET_NAME,
  InteractionTypeEnum.CHANGED_PET_COLOR_LEVEL,
  InteractionTypeEnum.CHANGED_PET_NEUTER_STATUS,
  InteractionTypeEnum.CHANGED_PET_SAFETY_INFO,
  InteractionTypeEnum.CHANGED_PET_MEDICAL_INFO,
  InteractionTypeEnum.CHANGED_PET_MANAGEMENT_INFO,
]);

const TASK_TEMPLATE_INTERACTIONS = new Set<InteractionTypeEnum>([
  InteractionTypeEnum.DELETED_TASK_TEMPLATE,
  InteractionTypeEnum.CHANGED_TASK_TEMPLATE_NAME,
  InteractionTypeEnum.CHANGED_TASK_TEMPLATE_INSTRUCTIONS,
]);

const TASK_INTERACTIONS = new Set<InteractionTypeEnum>([
  InteractionTypeEnum.ASSIGNED_TASK,
  InteractionTypeEnum.SELF_ASSIGNED_TASK,
  InteractionTypeEnum.UNASSIGNED_TASK,
  InteractionTypeEnum.STARTED_TASK,
  InteractionTypeEnum.RESTARTED_TASK,
  InteractionTypeEnum.COMPLETED_TASK,
  InteractionTypeEnum.MARKED_TASK_INCOMPLETE,
  InteractionTypeEnum.MARKED_TASK_INACTIVE,
  InteractionTypeEnum.DELETED_TASK,
  InteractionTypeEnum.CHANGED_TASK_ASSIGNEE,
  InteractionTypeEnum.CHANGED_TASK_INSTRUCTIONS,
  InteractionTypeEnum.CHANGED_TASK_START_DATE,
  InteractionTypeEnum.CHANGED_TASK_END_DATE,
  InteractionTypeEnum.DELETED_RECURRING_TASK,
  InteractionTypeEnum.CHANGED_RECURRING_TASK_NAME,
  InteractionTypeEnum.CHANGED_RECURRING_TASK_DAYS,
  InteractionTypeEnum.CHANGED_RECURRING_TASK_CADENCE,
]);

// declare logInteraction as async function that can be called from any route
export const logInteraction = async (req: Request, res: Response) => {
  try {
    // extract data from request
    const {
      actorId,
      targetId,
      interactionType,
      metadata = [],
      oldUserName,
      newUserName,
      taskTemplateName,
      petName,
      actorName,
      targetName,
      oldInstructions,
      newInstructions,
      oldTaskTemplateName,
      newTaskTemplateName,
      oldDate,
      newDate,
      oldDays,
      newDays,
      oldCadence,
      newCadence,
      oldText,
      newText,
      oldRole,
      newRole,
      oldColorLevel,
      newColorLevel,
      animalTag
    } = req.body;

    // if information missing, stop
    if (!interactionType || !actorId || !targetId) {
      console.warn("Skipping log, missing required fields");
      return;
    }

    // build shport and long descriptionriptions
    let short_description = "";
    let long_description = "";

    // switch-case to choose how to handle interaction depending on type
    switch (interactionType) {
      case InteractionTypeEnum.CHANGED_TASK_ASSIGNEE:
        if (!newUserName || !taskTemplateName || !petName || !oldUserName) {
          throw new Error(`Missing required fields for ${interactionType}`);
        }
        short_description = `Changed task assignee to ${newUserName} for ${taskTemplateName} with ${petName}`;
        long_description = `Changed task assignee from ${oldUserName} to ${newUserName} for ${taskTemplateName} with ${petName}.`;
        break;
      case InteractionTypeEnum.ASSIGNED_TASK:
        if (!taskTemplateName || !petName) {
          throw new Error(`Missing required fields for ${interactionType}`);
        }
        short_description = `Assigned ${taskTemplateName} to ${petName}`;
        long_description = `User ${actorId} assigned ${taskTemplateName} to ${petName}.`;
        break;

      case InteractionTypeEnum.SELF_ASSIGNED_TASK:
        if (!newUserName || !taskTemplateName || !petName) {
          throw new Error(`Missing required fields for ${interactionType}`);
        }
        short_description = `Self-assigned ${taskTemplateName} with ${petName}`;
        long_description = `${newUserName} self-assigned ${taskTemplateName.toLowerCase()} with ${petName}.`;
        break;

      case InteractionTypeEnum.UNASSIGNED_TASK:
        if (!taskTemplateName || !oldUserName || !petName || !actorName) {
          throw new Error(`Missing required fields for ${interactionType}`);
        }
        short_description = `Unassigned ${taskTemplateName} from ${oldUserName} with ${petName}`;
        long_description = `${actorName} is unassigned ${taskTemplateName.toLowerCase()} with ${petName}.`;
        break;

      case InteractionTypeEnum.STARTED_TASK:
        if (!taskTemplateName || !petName || !actorName) {
          throw new Error(`Missing required fields for ${interactionType}`);
        }
        short_description = `Started ${taskTemplateName} with ${petName}`;
        long_description = `${actorName} started ${taskTemplateName.toLowerCase()} with ${petName}.`;
        break;

      case InteractionTypeEnum.RESTARTED_TASK:
        if (!taskTemplateName || !petName || !actorName) {
          throw new Error(`Missing required fields for ${interactionType}`);
        }
        short_description = `Restarted ${taskTemplateName} with ${petName}`;
        long_description = `${actorName} restarted ${taskTemplateName.toLowerCase()} with ${petName}.`;
        break;

      case InteractionTypeEnum.COMPLETED_TASK:
        if (!taskTemplateName || !petName || !actorName) {
          throw new Error(`Missing required fields for ${interactionType}`);
        }
        short_description = `Completed ${taskTemplateName} with ${petName}`;
        long_description = `${actorName} completed ${taskTemplateName.toLowerCase()} with ${petName}.`;
        break;

      case InteractionTypeEnum.MARKED_TASK_INCOMPLETE:
        if (!taskTemplateName || !petName) {
          throw new Error(`Missing required fields for ${interactionType}`);
        }
        short_description = `${taskTemplateName} is an incomplete task with ${petName}`;
        long_description = oldUserName
          ? `${taskTemplateName} is an incomplete task. **It was last assigned to ${oldUserName}.**`
          : `${taskTemplateName} is an incomplete task. **Nobody was assigned this task.**`;
        break;

      case InteractionTypeEnum.MARKED_TASK_INACTIVE:
        if (!taskTemplateName || !petName) {
          throw new Error(`Missing required fields for ${interactionType}`);
        }
        short_description = `${taskTemplateName} is an inactive task with ${petName}`;
        long_description = `${taskTemplateName} is an inactive task. **It was last assigned to ${oldUserName ?? "N/A"}**`;
        break;

      case InteractionTypeEnum.DELETED_TASK:
        if (!taskTemplateName || !petName) {
          throw new Error(`Missing required fields for ${interactionType}`);
        }
        short_description = `Deleted task ${taskTemplateName} with ${petName}`;
        long_description = `Deleted task ${taskTemplateName.toLowerCase()} with ${petName}.`;
        break;

      case InteractionTypeEnum.CHANGED_TASK_INSTRUCTIONS:
        if (!taskTemplateName || !petName || !oldInstructions || !newInstructions) {
          throw new Error(`Missing required fields for ${interactionType}`);
        }
        if (oldInstructions && !newInstructions) {
          short_description = `Removed '${oldInstructions}' from ${taskTemplateName} with ${petName}`;
          long_description = `Changed task instructions from '${oldInstructions}' to '' for ${taskTemplateName} with ${petName}.`;
        } else if (!oldInstructions && newInstructions) {
          short_description = `Added '${newInstructions}' to ${taskTemplateName} with ${petName}`;
          long_description = `Changed task instructions from '' to '${newInstructions}' for ${taskTemplateName} with ${petName}.`;
        } else {
          short_description = `Changed task instructions of ${taskTemplateName} with ${petName} to ${newInstructions}`;
          long_description = `Changed task instructions from '${oldInstructions}' to '${newInstructions}' for ${taskTemplateName} with ${petName}.`;
        }
        break;

      case InteractionTypeEnum.CHANGED_TASK_START_DATE:
        if (!taskTemplateName || !petName || !newDate || !oldDate) {
          throw new Error(`Missing required fields for ${interactionType}`);
        }
        short_description = `Changed task start date of ${taskTemplateName} with ${petName} to ${newDate}`;
        long_description = `Changed task start date from ${oldDate} to ${newDate} for ${taskTemplateName} with ${petName}.`;
        break;

      case InteractionTypeEnum.CHANGED_TASK_END_DATE:
        if (!taskTemplateName || !petName || !newDate || !oldDate) {
          throw new Error(`Missing required fields for ${interactionType}`);
        }
        short_description = `Changed task end date of ${taskTemplateName} with ${petName} to ${newDate}`;
        if (oldDate === "indefinite" && newDate !== "indefinite") {
          long_description = `The end date of ${taskTemplateName} with ${petName} changed from indefinite to ${newDate}.`;
        } else if (oldDate !== "indefinite" && newDate === "indefinite") {
          long_description = `The end date of ${taskTemplateName} with ${petName} changed from ${oldDate} to indefinite.`;
        } else {
          long_description = `Changed task end date from ${oldDate} to ${newDate} for ${taskTemplateName} with ${petName}.`;
        }
        break;

      case InteractionTypeEnum.DELETED_RECURRING_TASK:
        if (!taskTemplateName || !petName) {
          throw new Error(`Missing required fields for ${interactionType}`);
        }
        short_description = `Deleted recurring task ${taskTemplateName} with ${petName}`;
        long_description = `Deleted recurring task ${taskTemplateName.toLowerCase()} with ${petName}.`;
        break;

      case InteractionTypeEnum.CHANGED_RECURRING_TASK_NAME:
        if (!oldText || !newText || !petName) {
          throw new Error(`Missing required fields for ${interactionType}`);
        }
        short_description = `Changed recurring task name of ${oldText} with ${petName} to ${newText}`;
        long_description = `Changed recurring task name from ${oldText} to ${newText} with ${petName}.`;
        break;

      case InteractionTypeEnum.CHANGED_RECURRING_TASK_DAYS:
        if (!taskTemplateName || !petName || oldDays === undefined || newDays === undefined) {
          throw new Error(`Missing required fields for ${interactionType}`);
        }
        short_description = `Changed recurring task days of ${taskTemplateName} with ${petName} to ${newDays}`;
        long_description = `Changed recurring task days from ${oldDays} to ${newDays} for ${taskTemplateName} with ${petName}.` +
          (oldDays === null ? " This is now a repeating task." : "") +
          (newDays === null ? " This is no longer a repeating task." : "");
        break;

      case InteractionTypeEnum.CHANGED_RECURRING_TASK_CADENCE:
        if (!taskTemplateName || !petName || oldCadence === undefined || newCadence === undefined) {
          throw new Error(`Missing required fields for ${interactionType}`);
        }
        short_description = `Changed recurring task cadence of ${taskTemplateName} with ${petName} to ${newCadence}`;
        long_description = `Changed recurring task cadence from ${oldCadence} to ${newCadence} for ${taskTemplateName} with ${petName}.` +
          (oldCadence === null ? " This is now a repeating task." : "") +
          (newCadence === null ? " This is no longer a repeating task." : "");
        break;

      case InteractionTypeEnum.CHANGED_USER_NAME:
        if (!oldUserName || !newUserName) {
          throw new Error(`Missing required fields for ${interactionType}`);
        }
        short_description = `Changed ${oldUserName}'s name to ${newUserName}`;
        long_description = `Changed ${oldUserName}'s name from ${oldUserName} to ${newUserName}.`;
        break;

      case InteractionTypeEnum.CHANGED_USER_COLOR_LEVEL:
        if (!targetName || !newColorLevel || !oldColorLevel) {
          throw new Error(`Missing required fields for ${interactionType}`);
        }
        short_description = `Changed ${targetName}'s colour level to ${newColorLevel}`;
        long_description = `Changed ${targetName}'s colour level from ${oldColorLevel.toLowerCase()} to ${newColorLevel.toLowerCase()}.`;
        break;

      case InteractionTypeEnum.CHANGED_USER_ROLE:
        if (!targetName || !newRole || !oldRole) {
          throw new Error(`Missing required fields for ${interactionType}`);
        }
        short_description = `Changed ${targetName}'s role to ${newRole}`;
        long_description = `Changed ${targetName}'s role from ${oldRole.toLowerCase()} to ${newRole.toLowerCase()}.`;
        break;

      case InteractionTypeEnum.INVITED_USER:
        if (!targetName) {
          throw new Error(`Missing required fields for ${interactionType}`);
        }
        short_description = `Invited user ${targetName}`;
        long_description = `Invited user ${targetName}.`;
        break;

      case InteractionTypeEnum.DELETED_USER:
        if (!targetName) {
          throw new Error(`Missing required fields for ${interactionType}`);
        }
        short_description = `Deleted user ${targetName}`;
        long_description = `Deleted user ${targetName}.`;
        break;

      case InteractionTypeEnum.DELETED_PET:
        if (!animalTag || !petName) {
          throw new Error(`Missing required fields for ${interactionType}`);
        }
        short_description = `Deleted ${animalTag.toLowerCase()} ${petName}`;
        long_description = `Deleted ${animalTag.toLowerCase()} ${petName}.`;
        break;

      case InteractionTypeEnum.CHANGED_PET_NAME:
        if (!oldUserName || !newUserName) {
          throw new Error(`Missing required fields for ${interactionType}`);
        }
        short_description = `Changed ${oldUserName}'s name to ${newUserName}`;
        long_description = `Changed ${oldUserName}'s name from ${oldUserName} to ${newUserName}.`;
        break;

      case InteractionTypeEnum.CHANGED_PET_COLOR_LEVEL:
        if (!petName || !newColorLevel || !oldColorLevel) {
          throw new Error(`Missing required fields for ${interactionType}`);
        }
        short_description = `Changed ${petName}'s colour level to ${newColorLevel}`;
        long_description = `Changed ${petName}'s colour level from ${oldColorLevel.toLowerCase()} to ${newColorLevel.toLowerCase()}.`;
        break;

      case InteractionTypeEnum.CHANGED_PET_NEUTER_STATUS:
        if (!petName || !newText || !oldText) {
          throw new Error(`Missing required fields for ${interactionType}`);
        }
        short_description = `Changed ${petName}'s neuter status to ${newText}`;
        long_description = `Changed ${petName}'s neuter status from ${oldText} to ${newText}.`;
        break;

      case InteractionTypeEnum.CHANGED_PET_SAFETY_INFO:
        if (!petName || !oldText || !newText) {
          throw new Error(`Missing required fields for ${interactionType}`);
        }
        if (oldText && !newText) {
          short_description = `Removed '${oldText}' from ${petName}'s safety info`;
          long_description = `Changed ${petName}'s safety info from '${oldText}' to ''.`;
        } else if (!oldText && newText) {
          short_description = `Added '${newText}' to ${petName}'s safety info`;
          long_description = `Changed ${petName}'s safety info from '' to '${newText}'.`;
        } else {
          short_description = `Changed ${petName}'s safety info`;
          long_description = `Changed ${petName}'s safety info from '${oldText}' to '${newText}'.`;
        }
        break;

      case InteractionTypeEnum.CHANGED_PET_MEDICAL_INFO:
        if (!petName || !oldText || !newText) {
          throw new Error(`Missing required fields for ${interactionType}`);
        }
        if (oldText && !newText) {
          short_description = `Removed '${oldText}' from ${petName}'s medical info`;
          long_description = `Changed ${petName}'s medical info from '${oldText}' to ''.`;
        } else if (!oldText && newText) {
          short_description = `Added '${newText}' to ${petName}'s medical info`;
          long_description = `Changed ${petName}'s medical info from '' to '${newText}'.`;
        } else {
          short_description = `Changed ${petName}'s medical info`;
          long_description = `Changed ${petName}'s medical info from '${oldText}' to '${newText}'.`;
        }
        break;

      case InteractionTypeEnum.CHANGED_PET_MANAGEMENT_INFO:
        if (!petName || !oldText || !newText) {
          throw new Error(`Missing required fields for ${interactionType}`);
        }
        if (oldText && !newText) {
          short_description = `Removed '${oldText}' from ${petName}'s management info`;
          long_description = `Changed ${petName}'s management info from '${oldText}' to ''.`;
        } else if (!oldText && newText) {
          short_description = `Added '${newText}' to ${petName}'s management info`;
          long_description = `Changed ${petName}'s management info from '' to '${newText}'.`;
        } else {
          short_description = `Changed ${petName}'s management info`;
          long_description = `Changed ${petName}'s management info from '${oldText}' to '${newText}'.`;
        }
        break;

      case InteractionTypeEnum.DELETED_TASK_TEMPLATE:
        if (!taskTemplateName) {
          throw new Error(`Missing required fields for ${interactionType}`);
        }
        short_description = `Deleted task template ${taskTemplateName}`;
        long_description = `Deleted the task template ${taskTemplateName.toLowerCase()}.`;
        break;

      case InteractionTypeEnum.CHANGED_TASK_TEMPLATE_NAME:
        if (!oldTaskTemplateName || !newTaskTemplateName) {
          throw new Error(`Missing required fields for ${interactionType}`);
        }
        short_description = `Changed task template name of ${oldTaskTemplateName} to ${newTaskTemplateName}`;
        long_description = `Changed the task template name of ${oldTaskTemplateName} from ${oldTaskTemplateName} to ${newTaskTemplateName}.`;
        break;

      case InteractionTypeEnum.CHANGED_TASK_TEMPLATE_INSTRUCTIONS:
        if (!taskTemplateName || (!oldInstructions && !newInstructions)) {
          throw new Error(`Missing required fields for ${interactionType}`);
        }
        if (oldInstructions && !newInstructions) {
          short_description = `Removed '${oldInstructions}' from ${taskTemplateName}'s instructions`;
          long_description = `Changed the task template instructions of ${taskTemplateName} from '${oldInstructions}' to ''.`;
        } else if (!oldInstructions && newInstructions) {
          short_description = `Added '${newInstructions}' to ${taskTemplateName}'s instructions`;
          long_description = `Changed the task template instructions of ${taskTemplateName} from '' to '${newInstructions}'.`;
        } else {
          short_description = `Changed task template instructions of ${taskTemplateName} to ${newInstructions}`;
          long_description = `Changed the task template instructions of ${taskTemplateName} from '${oldInstructions}' to '${newInstructions}'.`;
        }
        break;

      // unknown type
      default:
        console.warn(`No handler for ${interactionType}`);
        return;
    }

    // get the interaction type ID
    const interactionTypeId = await InteractionService.getInteractionTypeId(interactionType);

    // decide which of 4 target columns should be filled and set others to null.
    const targetUserId = USER_INTERACTIONS.has(interactionType) ? targetId : null;
    const targetPetId = PET_INTERACTIONS.has(interactionType) ? targetId : null;
    const targetTaskId = TASK_INTERACTIONS.has(interactionType) ? targetId : null;
    const targetTaskTemplateId = TASK_TEMPLATE_INTERACTIONS.has(interactionType)
      ? targetId
      : null;

    // log interaction in DB
    await InteractionService.log({
      actorId,
      targetUserId,
      targetPetId,
      targetTaskId,
      targetTaskTemplateId,
      interactionTypeId,
      metadata,
      short_description,
      long_description,
    });

    // success/error messages

    console.log(`Logged ${interactionType}`);
  } catch (err) {
    console.error("Error logging interaction:", err);
  }
};
