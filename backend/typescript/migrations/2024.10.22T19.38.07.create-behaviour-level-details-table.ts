import { DataType } from "sequelize-typescript";

import { Migration } from "../umzug";

const TABLE_NAME = "behaviour_level_details";

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
    },
    level: {
      type: DataType.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataType.STRING,
      allowNull: false,
    },
    training_instructions: {
      type: DataType.STRING,
      allowNull: false,
    },
  });

  await sequelize.getQueryInterface().addConstraint(TABLE_NAME, {
    fields: ["behaviour_id", "level"],
    type: "unique",
    name: "unique_behaviour_level",
  });
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().dropTable(TABLE_NAME);
};
