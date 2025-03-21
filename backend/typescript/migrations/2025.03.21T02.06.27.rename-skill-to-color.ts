import { Migration } from "../umzug";

const TABLE_ONE = "users"
const TABLE_TWO = "pets";
const OLD_COLUMN_NAME = "skill_level";
const NEW_COLUMN_NAME = "color_level";

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().renameColumn(TABLE_ONE, OLD_COLUMN_NAME, NEW_COLUMN_NAME);
  await sequelize.getQueryInterface().renameColumn(TABLE_TWO, OLD_COLUMN_NAME, NEW_COLUMN_NAME);
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().renameColumn(TABLE_TWO, NEW_COLUMN_NAME, OLD_COLUMN_NAME);
  await sequelize.getQueryInterface().renameColumn(TABLE_ONE, NEW_COLUMN_NAME, OLD_COLUMN_NAME);
};
