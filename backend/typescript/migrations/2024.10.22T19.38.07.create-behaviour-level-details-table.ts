import { DataType } from "sequelize-typescript";

import { Migration } from "../umzug";

const TABLE_NAME = "behaviour_level_details";
const CONSTRAINT_NAME = "unique_behaviour_level";

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable(TABLE_NAME, {
    id: {
      type: DataType.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    behaviour_id: {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: "behaviours",
        key: "id",
      },
    },
    level: {
      type: DataType.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataType.STRING,
      allowNull: true,
    },
    training_instructions: {
      type: DataType.STRING,
      allowNull: true,
    },
  });

  await sequelize.getQueryInterface().addConstraint(TABLE_NAME, {
    fields: ["behaviour_id", "level"],
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
