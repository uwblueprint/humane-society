import { DataType } from "sequelize-typescript";

import { Migration } from "../umzug";
import { MAX_BEHAVIOUR_LEVEL, MIN_BEHAVIOUR_LEVEL } from "../constants";

const TABLE_NAME = "user_behaviours";
const CONSTRAINT_NAME = "unique_user_behaviour_skill";

export const up: Migration = async ({ context: sequelize }) => {
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
      validate: {
        min: MIN_BEHAVIOUR_LEVEL,
        max: MAX_BEHAVIOUR_LEVEL,
      },
      allowNull: false,
    },
  });

  await sequelize.getQueryInterface().addConstraint(TABLE_NAME, {
    fields: ["behaviour_id", "user_id"],
    type: "unique",
    name: CONSTRAINT_NAME,
  });
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .removeConstraint(TABLE_NAME, CONSTRAINT_NAME);

  await sequelize.getQueryInterface().dropTable(TABLE_NAME);
};
