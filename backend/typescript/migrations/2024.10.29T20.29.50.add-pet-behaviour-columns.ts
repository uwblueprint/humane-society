import { DataType } from "sequelize-typescript";
import { Migration } from "../umzug";
import { MIN_BEHAVIOUR_LEVEL, MAX_BEHAVIOUR_LEVEL } from "../constants";

const TABLE_NAME = "pet_behaviours";
const CONSTRAINT_NAME = "unique_pet_behaviour";
const CONSTRAINT_NAME_2 = "skill_level_interval";

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().addColumn(TABLE_NAME, "is_highlighted", {
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  });

  await sequelize.getQueryInterface().addConstraint(TABLE_NAME, {
    fields: ["behaviour_id", "pet_id"],
    type: "unique",
    name: CONSTRAINT_NAME,
  });

  await sequelize.query(
    `ALTER TABLE ${TABLE_NAME} ADD CONSTRAINT ${CONSTRAINT_NAME_2} 
    CHECK (skill_level BETWEEN ${MIN_BEHAVIOUR_LEVEL} AND ${MAX_BEHAVIOUR_LEVEL});`,
  );
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .removeConstraint(TABLE_NAME, CONSTRAINT_NAME);

  await sequelize
    .getQueryInterface()
    .removeColumn(TABLE_NAME, "is_highlighted");

  await sequelize.query(
    `ALTER TABLE ${TABLE_NAME} DROP CONSTRAINT ${CONSTRAINT_NAME_2};`,
  );
};
