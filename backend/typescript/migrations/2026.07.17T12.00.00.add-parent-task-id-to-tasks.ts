import { DataType } from "sequelize-typescript";
import { Migration } from "../umzug";

const TABLE_NAME = "tasks";
const COLUMN_NAME = "parent_task_id";

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().addColumn(TABLE_NAME, COLUMN_NAME, {
    type: DataType.INTEGER,
    allowNull: true,
    references: {
      model: TABLE_NAME,
      key: "id",
    },
    onDelete: "CASCADE",
  });
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().removeColumn(TABLE_NAME, COLUMN_NAME);
};
