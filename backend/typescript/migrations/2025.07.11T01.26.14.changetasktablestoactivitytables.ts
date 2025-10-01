// import { Migration } from "../umzug";
import { QueryInterface } from "sequelize";

const OLD_TASKS_TABLE = "activities";
const NEW_TASKS_TABLE = "tasks";
const OLD_TASKTEMPLATES_TABLE = "activity_types";
const NEW_TASKTEMPLATES_TABLE = "task_templates";

const OLD_ID_COL = "activity_type_id";
const NEW_ID_COL = "task_template_id";
const OLD_TASK_NAME = "activity_name";
const NEW_TASK_NAME = "task_name";

module.exports = {
  up: async (queryInterface: QueryInterface, Sequelize: any) => {

  await queryInterface.renameTable(
    // rename activities table to tasks
    OLD_TASKS_TABLE,
    NEW_TASKS_TABLE,
  );

  await queryInterface.renameTable(
    // rename activitytypes to task templates
    OLD_TASKTEMPLATES_TABLE,
    NEW_TASKTEMPLATES_TABLE,
  );

  await queryInterface.renameColumn(
    // rename activity type id to task type id
    NEW_TASKS_TABLE,
    OLD_ID_COL,
    NEW_ID_COL,
  );

  await queryInterface.renameColumn(
    // rename activity name to task name
    NEW_TASKTEMPLATES_TABLE,
    OLD_TASK_NAME,
    NEW_TASK_NAME,
  );

  },
  down: async (queryInterface: QueryInterface, Sequelize: any) => {
    
  await queryInterface.renameColumn(
    // rename taskid back to activityid col
    NEW_TASKS_TABLE,
    NEW_ID_COL,
    OLD_ID_COL,
  );

  await queryInterface.renameTable(
    // rename tasktemplate table back to activity types
    NEW_TASKTEMPLATES_TABLE,
    OLD_TASKTEMPLATES_TABLE,
  );

  await queryInterface.renameTable(
    // rename tasks table back to activites
    NEW_TASKS_TABLE,
    OLD_TASKS_TABLE,
  );
  },
};
