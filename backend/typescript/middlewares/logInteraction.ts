import { Request, Response } from "express";
import { InteractionService } from "../services/implementations/interactionService"; // import service that write logs to DB
import { InteractionTypeEnum } from "../types"; // enum lists all possible interaction types

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
      case InteractionTypeEnum.TASK_ASSIGNEE_CHANGED:
        short_description = `Changed task assignee to ${newUserName} for ${taskTemplateName} with ${petName}`;
        long_description = `Changed task assignee from ${oldUserName} to ${newUserName} for ${taskTemplateName} with ${petName}.`;
        break;
      case InteractionTypeEnum.TASK_ASSIGNED:
        short_description = `Assigned ${taskTemplateName} to ${petName}`;
        long_description = `User ${actorId} assigned ${taskTemplateName} to ${petName}.`;
        break;

      // unknown type
      default:
        console.warn(`No handler for ${interactionType}`);
        return;
    }

    // get the interaction type ID
    const interactionTypeId = await InteractionService.getInteractionTypeId(interactionType);

    // decide which of 4 target columns should be filled and set others to null.
    const targetUserId =
      interactionType.includes("USER") && !interactionType.includes("TASK") ? targetId : null;
    const targetPetId = interactionType.includes("PET") ? targetId : null;
    const targetTaskId = interactionType.includes("TASK_") ? targetId : null;
    const targetTaskTemplateId = interactionType.includes("TASK_TEMPLATE") ? targetId : null;

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
