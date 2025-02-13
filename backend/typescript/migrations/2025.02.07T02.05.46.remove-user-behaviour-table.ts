import { DataType } from "sequelize-typescript";

import { Migration } from "../umzug";

// hard coded so that we can remove the constants from the constants.ts file
const MIN_BEHAVIOUR_LEVEL = 1;
const MAX_BEHAVIOUR_LEVEL = 4;

const TABLE_NAME = "user_behaviours";
const CONSTRAINT_NAME = "unique_user_behaviour_skill";
const CONSTRAINT_NAME_2 = "max_level_interval";

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .removeConstraint(TABLE_NAME, CONSTRAINT_NAME);

  await sequelize.query(
    `ALTER TABLE ${TABLE_NAME} DROP CONSTRAINT ${CONSTRAINT_NAME_2};`,
  );

  await sequelize.getQueryInterface().dropTable(TABLE_NAME);
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable(TABLE_NAME, {
    id: {
      type: DataType.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    behaviour_id: {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: "behaviours",
        key: "id",
      },
    },
    max_level: {
      type: DataType.INTEGER,
      allowNull: false,
    },
  });

  await sequelize.getQueryInterface().addConstraint(TABLE_NAME, {
    fields: ["behaviour_id", "user_id"],
    type: "unique",
    name: CONSTRAINT_NAME,
  });

  await sequelize.query(
    `ALTER TABLE ${TABLE_NAME} ADD CONSTRAINT ${CONSTRAINT_NAME_2} 
    CHECK (max_level BETWEEN ${MIN_BEHAVIOUR_LEVEL} AND ${MAX_BEHAVIOUR_LEVEL});`,
  );
};
