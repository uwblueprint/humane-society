import { Migration } from "../umzug";
import { InteractionTypeEnum } from "../types";

export const up: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();

  const interactionTypes = Object.values(InteractionTypeEnum).map((type) => ({
    action_type: type,
  }));

  await queryInterface.bulkInsert("interaction_types", interactionTypes, {});
};

export const down: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();

  await queryInterface.bulkDelete("interaction_types", {}, {});
};
