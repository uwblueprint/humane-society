import { DataType } from "sequelize-typescript";
import { Migration } from "../umzug";
import { TaskType } from "../types";

const TABLE_NAME = "activity_types";

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().addColumn(TABLE_NAME, "taskType", {
    type: DataType.ENUM(...Object.values(TaskType)),
    allowNull: false,
    defaultValue: TaskType.MISC,
  });
  await sequelize.getQueryInterface().addColumn(TABLE_NAME, "instruction", {
    type: DataType.TEXT,
    allowNull: true,
  });
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().removeColumn(TABLE_NAME, "taskType");
  await sequelize.getQueryInterface().removeColumn(TABLE_NAME, "instruction");
  // delete taskType enum, otherwise causes issues with migrating up, down, then up
  await sequelize
    .getQueryInterface()
    .sequelize.query('DROP TYPE IF EXISTS "enum_task_templates_taskType";');
};
