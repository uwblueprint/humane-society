import { DataType } from "sequelize-typescript";
import { Migration } from "../umzug";

const TABLE_NAME = "tasks";
const COLUMN_NAME = "scheduled_end_time";

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().addColumn(TABLE_NAME, COLUMN_NAME, {
    type: DataType.DATE,
    allowNull: true,
  });
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().removeColumn(TABLE_NAME, COLUMN_NAME);
};
