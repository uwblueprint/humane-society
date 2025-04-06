import { DataType } from "sequelize-typescript";

import { Migration } from "../umzug";

const ANIMAL_TYPE_TABLE_NAME = "animal_types";

export const up: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.dropTable(ANIMAL_TYPE_TABLE_NAME);
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable(ANIMAL_TYPE_TABLE_NAME, {
    id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    animal_type_name: {
      type: DataType.STRING,
      allowNull: false,
    },
  });
};
