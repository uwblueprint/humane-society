import { DataType } from "sequelize-typescript";
import { Migration } from "../umzug";

const OLD_TABLE_NAME = "tasks";
const NEW_TABLE_NAME = "task_templates";
const USER_PET_ACTIVITIES_TABLE = "user_pet_tasks";
const ACTIVITIES_TABLE = "tasks";

export const up: Migration = async ({ context: sequelize }) => {
  // Rename the tasks table to task_templates
  await sequelize
    .getQueryInterface()
    .renameTable(OLD_TABLE_NAME, NEW_TABLE_NAME);

  // Change the task_id column in user_pet_tasks to task_template_id
  await sequelize
    .getQueryInterface()
    .renameColumn(USER_PET_ACTIVITIES_TABLE, "task_id", "task_template_id");

  // Update the references for task_template_id to point to the new task_templates table
  await sequelize
    .getQueryInterface()
    .changeColumn(USER_PET_ACTIVITIES_TABLE, "task_template_id", {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: NEW_TABLE_NAME, // Reference the new table name
        key: "id",
      },
    });

  // Change the name of user_pet_tasks to tasks
  await sequelize
    .getQueryInterface()
    .renameTable(USER_PET_ACTIVITIES_TABLE, ACTIVITIES_TABLE);
};

export const down: Migration = async ({ context: sequelize }) => {
  // Rename the tasks table back to user_pet_tasks
  await sequelize
    .getQueryInterface()
    .renameTable(ACTIVITIES_TABLE, USER_PET_ACTIVITIES_TABLE);

  // Rename the task_templates table back to tasks
  await sequelize
    .getQueryInterface()
    .renameTable(NEW_TABLE_NAME, OLD_TABLE_NAME);

  // Revert the task_template_id column back to task_id
  await sequelize
    .getQueryInterface()
    .renameColumn(USER_PET_ACTIVITIES_TABLE, "task_template_id", "task_id");

  // Revert the task_id column to reference the old tasks table
  await sequelize
    .getQueryInterface()
    .changeColumn(USER_PET_ACTIVITIES_TABLE, "task_id", {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: OLD_TABLE_NAME, // Revert back to the old table name
        key: "id",
      },
    });
};
