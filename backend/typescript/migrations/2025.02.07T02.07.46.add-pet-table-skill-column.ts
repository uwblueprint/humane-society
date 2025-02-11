import { DataType } from "sequelize-typescript";
import { MIN_SKILL_LEVEL, MAX_SKILL_LEVEL } from "../constants";
import { Migration } from "../umzug";

const TABLE_NAME = "pets";
const SKILL_LEVEL_INTERVAL = "skill_level_interval";

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().addColumn(TABLE_NAME, "skill_level", {
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 5,
  });
  await sequelize.query(
    `ALTER TABLE ${TABLE_NAME} ADD CONSTRAINT ${SKILL_LEVEL_INTERVAL} 
    CHECK (skill_level BETWEEN ${MIN_SKILL_LEVEL} AND ${MAX_SKILL_LEVEL});`,
  );
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize.query(
    `ALTER TABLE ${TABLE_NAME} DROP CONSTRAINT ${SKILL_LEVEL_INTERVAL};`,
  );
  await sequelize.getQueryInterface().removeColumn(TABLE_NAME, "skill_level");
};
