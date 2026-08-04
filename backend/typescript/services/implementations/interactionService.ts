import Interaction from "../../models/interaction.model";
import InteractionType from "../../models/interactionType.model";
import User from "../../models/user.model";

const InteractionService = {
  async getInteractions() {
    try {
      const interactions = await Interaction.findAll({
        include: [
          {
            model: User,
            as: "actor",
            attributes: [
              "id",
              "first_name",
              "last_name",
              "role",
              "profile_photo",
            ],
          },
          {
            model: InteractionType,
            attributes: ["action_type"],
          },
        ],
        order: [["created_at", "DESC"]],
      });

      return interactions.map((interaction) => ({
        id: interaction.id,
        shortDescription: interaction.short_description,
        longDescription: interaction.long_description,
        createdAt: interaction.getDataValue("created_at"),
        interactionType: interaction.interaction_type?.action_type ?? "Unknown",
        actor: interaction.actor
          ? {
              id: interaction.actor.id,
              firstName: interaction.actor.first_name,
              lastName: interaction.actor.last_name,
              role: interaction.actor.role,
              profilePhoto: interaction.actor.profile_photo ?? null,
            }
          : null,
      }));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error fetching interactions:", err);
      throw err;
    }
  },

  async getInteractionTypeId(interactionTypeEnum: string) {
    try {
      const type = await InteractionType.findOne({
        where: { action_type: interactionTypeEnum },
      });
      if (!type)
        throw new Error(`Interaction type not found: ${interactionTypeEnum}`);
      return type.id;
    } catch (err) {
      // eslint-disable-next-line no-console
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
      const interaction = await Interaction.create({
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
      // eslint-disable-next-line no-console
      console.error("Error logging interaction:", err);
      throw err;
    }
  },
};
export default InteractionService;
