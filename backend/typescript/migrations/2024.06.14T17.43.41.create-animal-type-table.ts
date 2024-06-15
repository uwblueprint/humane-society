import { DataType } from "sequelize-typescript";

import { Migration } from "../umzug";

const TABLE_NAME = "animal_types";

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable(TABLE_NAME, {
    animal_type_id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    animal_type_name: {
      type: DataType.STRING,
      allowNull: false,
    },
    createdAt: DataType.DATE,
    updatedAt: DataType.DATE,
  });
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().dropTable(TABLE_NAME);
};
