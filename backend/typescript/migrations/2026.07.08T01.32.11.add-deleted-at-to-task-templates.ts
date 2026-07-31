import { DataType } from "sequelize-typescript";
import { Migration } from "../umzug";

const TABLE_NAME = "task_templates";

export const up: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();

  await queryInterface.addColumn(TABLE_NAME, "deleted_at", {
    type: DataType.DATE,
    allowNull: true,
  });
};

export const down: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();

  await queryInterface.removeColumn(TABLE_NAME, "deleted_at");
};
