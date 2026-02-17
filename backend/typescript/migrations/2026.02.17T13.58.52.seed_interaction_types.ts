import type { MigrationFn } from "umzug";
import { InteractionTypeEnum } from "../types";

export const up: MigrationFn = async (params: any) => {
  const context = params.context;
  const queryInterface = context.getQueryInterface?.() ?? context;

  const interactionTypes = Object.values(InteractionTypeEnum).map((type) => ({
    action_type: type,
  }));

  await queryInterface.bulkInsert("interaction_types", interactionTypes, {});
};

export const down: MigrationFn = async (params: any) => {
  const context = params.context;
  const queryInterface = context.getQueryInterface?.() ?? context;

  await queryInterface.bulkDelete("interaction_types", null, {});
};
