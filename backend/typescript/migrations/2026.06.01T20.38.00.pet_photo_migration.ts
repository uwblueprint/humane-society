import { DataType } from "sequelize-typescript";
import { Migration } from "../umzug";

const TABLE_NAME = "pets";

export const up: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();

  await queryInterface.changeColumn(TABLE_NAME, "photo", {
    type: DataType.TEXT,
    allowNull: true,
  });
};

export const down: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();

  await queryInterface.changeColumn(TABLE_NAME, "photo", {
    type: DataType.STRING,
    allowNull: true,
  });
};
