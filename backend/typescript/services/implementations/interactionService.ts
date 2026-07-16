import { Op } from "sequelize";
import Interaction from "../../models/interaction.model";
import InteractionType from "../../models/interactionType.model";
import User from "../../models/user.model";
import { InteractionTypeEnum, Role } from "../../types";

// Interactions about another user. Staff are not permitted to see these
// (permissions sheet); Admin and Animal Behaviourist are.
// These are the "Personal Details" and "User Details" groupings in
// InteractionTypeEnum. The groupings are only comments, not data, so the types
// are listed explicitly here.
const USER_INFO_INTERACTION_TYPES: string[] = [
  InteractionTypeEnum.CHANGED_USER_NAME,
  InteractionTypeEnum.CHANGED_USER_COLOR_LEVEL,
  InteractionTypeEnum.CHANGED_USER_ROLE,
  InteractionTypeEnum.INVITED_USER,
  InteractionTypeEnum.DELETED_USER,
];

const InteractionService = {
  async getInteractions(requesterRole?: Role) {
    try {
      // Staff must not receive interactions about other users' information.
      // Filtering here (server-side) ensures the data never leaves the backend.
      const excludeUserInfoTypes = requesterRole === Role.STAFF;

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
            ...(excludeUserInfoTypes
              ? {
                  required: true,
                  where: {
                    action_type: { [Op.notIn]: USER_INFO_INTERACTION_TYPES },
                  },
                }
              : {}),
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
