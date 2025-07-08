import { DataType } from "sequelize-typescript";
import { Migration } from "../umzug";
import { TaskType } from "../types";

const TASKTEMPLATES_TABLE = "task_templates";
const TASK_TYPE = "task_type";

export const up: Migration = async ({ context: sequelize }) => {
  const queryinterface = sequelize.getQueryInterface();
  // remove column so we can change type
  await queryinterface.removeColumn(TASKTEMPLATES_TABLE, TASK_TYPE);

  // make sure this type does not already exist

  //    await queryinterface.sequelize.query(
  //      'DROP TYPE IF EXISTS "enum_task_templates_task_type";'
  // );

  // add column with updated tasktype defintion
  await queryinterface.addColumn(TASKTEMPLATES_TABLE, TASK_TYPE, {
    type: DataType.ENUM(...Object.values(TaskType)),
    allowNull: false,
    defaultValue: TaskType.MISC,
  });
};
export const down: Migration = async ({ context: sequelize }) => {
  const queryinterface = sequelize.getQueryInterface();

  // remove column to change type
  await queryinterface.removeColumn(TASKTEMPLATES_TABLE, TASK_TYPE);

  // drop the type since you can't change the type if it already exists
  await queryinterface.sequelize.query(
    'DROP TYPE IF EXISTS "enum_task_templates_task_type";',
  );

  // adds column to change type
  await queryinterface.addColumn(TASKTEMPLATES_TABLE, TASK_TYPE, {
    type: DataType.ENUM(...Object.values(TaskType)),
    allowNull: false,
    defaultValue: TaskType.MISC,
  });
};
