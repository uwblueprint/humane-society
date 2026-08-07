import { DataType } from "sequelize-typescript";
import { Migration } from "../umzug";

const TABLE_NAME = "tasks";

export const up: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();

  await queryInterface.addColumn(TABLE_NAME, "origin_task_id", {
    type: DataType.INTEGER,
    allowNull: true,
    references: { model: TABLE_NAME, key: "id" },
    onDelete: "CASCADE",
  });

  await queryInterface.addColumn(TABLE_NAME, "occurrence_date", {
    type: DataType.DATE,
    allowNull: true,
  });
};

export const down: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();

  await queryInterface.removeColumn(TABLE_NAME, "occurrence_date");
  await queryInterface.removeColumn(TABLE_NAME, "origin_task_id");
};
