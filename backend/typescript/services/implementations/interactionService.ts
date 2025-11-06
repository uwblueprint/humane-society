import { sequelize } from "../../models";

export const InteractionService = {
  async getInteractionTypeId(interactionTypeEnum: string) {
    try {
      const type = await sequelize.models.InteractionType.findOne({
        where: { action_type: interactionTypeEnum },
      });
      if (!type) throw new Error(`Interaction type not found: ${interactionTypeEnum}`);
      // @ts-ignore
      return type.id;
    } catch (err) {
      console.error("Error fetching interaction type:", err);
      throw err;
    }
  },

  async log({
    actorId,
    targetUserId = null,
    targetPetId = null,
    targetTaskId = null,
    targetTaskTemplateId = null,
    interactionTypeId,
    metadata,
    short_description,
    long_description,
  }: {
    actorId: number;
    targetUserId?: number | null;
    targetPetId?: number | null;
    targetTaskId?: number | null;
    targetTaskTemplateId?: number | null;
    interactionTypeId: number;
    metadata: string[];
    short_description: string;
    long_description: string;
  }) {
    try {
      const interaction = await sequelize.models.Interaction.create({
        actor_id: actorId,
        target_user_id: targetUserId,
        target_pet_id: targetPetId,
        target_task_id: targetTaskId,
        target_task_template_id: targetTaskTemplateId,
        interaction_type_id: interactionTypeId,
        metadata,
        short_description,
        long_description,
      });
      return interaction;
    } catch (err) {
      console.error("Error logging interaction:", err);
      throw err;
    }
  },
};
