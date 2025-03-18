import { DataType } from "sequelize-typescript";
import { Migration } from "../umzug";

const TABLE_NAME = "pets";
const OLD_COLUMN_NAME = "skill_level";
const NEW_COLUMN_NAME = "color_level";
const SKILL_LEVEL_INTERVAL = "skill_level_interval";
const COLOR_LEVEL_INTERVAL = "color_level_interval";
const MIN_COLOR_LEVEL = "'Blue'";
const MAX_COLOR_LEVEL = "'Green'";
const MIN_COLOR_INT = 1;
const MAX_COLOR_INT = 5;

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().removeColumn(TABLE_NAME, OLD_COLUMN_NAME);
  await sequelize.getQueryInterface().addColumn(TABLE_NAME, NEW_COLUMN_NAME, {
    type: DataType.ENUM("Blue", "Red", "Orange", "Yellow", "Green"),
    allowNull: false,
    defaultValue: "Blue",
  });
  await sequelize.query(
    `ALTER TABLE ${TABLE_NAME} ADD CONSTRAINT ${COLOR_LEVEL_INTERVAL} 
        CHECK (${NEW_COLUMN_NAME} >= ${MIN_COLOR_LEVEL} and ${NEW_COLUMN_NAME} <= ${MAX_COLOR_LEVEL});`,
  );
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .removeConstraint(TABLE_NAME, COLOR_LEVEL_INTERVAL);
  await sequelize.getQueryInterface().removeColumn(TABLE_NAME, NEW_COLUMN_NAME);
  await sequelize.getQueryInterface().addColumn(TABLE_NAME, OLD_COLUMN_NAME, {
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 5,
  });
  await sequelize.query(
    `ALTER TABLE ${TABLE_NAME} ADD CONSTRAINT ${SKILL_LEVEL_INTERVAL} 
       CHECK (skill_level BETWEEN ${MIN_COLOR_INT} AND ${MAX_COLOR_INT});`,
  );
  await sequelize.query('DROP TYPE IF EXISTS "enum_pets_color_level";');
};
