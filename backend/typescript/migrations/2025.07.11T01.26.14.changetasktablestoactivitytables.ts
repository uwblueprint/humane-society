import { Migration } from "../umzug";

const OLD_TASKS_TABLE = "activities";
const NEW_TASKS_TABLE = "tasks";
const OLD_TASKTEMPLATES_TABLE = "activity_types";
const NEW_TASKTEMPLATES_TABLE = "task_templates";

const OLD_ID_COL = "activity_type_id";
const NEW_ID_COL = "task_template_id";
const OLD_TASK_NAME = "activity_name";
const NEW_TASK_NAME = "task_name";

export const up: Migration = async ({ context: sequelize }) => {
  const queryinterface = sequelize.getQueryInterface();

  await queryinterface.renameTable(
    // rename activities table to tasks
    OLD_TASKS_TABLE,
    NEW_TASKS_TABLE,
  );

  await queryinterface.renameTable(
    // rename activitytypes to task templates
    OLD_TASKTEMPLATES_TABLE,
    NEW_TASKTEMPLATES_TABLE,
  );

  await queryinterface.renameColumn(
    // rename activity type id to task type id
    NEW_TASKS_TABLE,
    OLD_ID_COL,
    NEW_ID_COL,
  );

  await queryinterface.renameColumn(
    // rename activity name to task name
    NEW_TASKTEMPLATES_TABLE,
    OLD_TASK_NAME,
    NEW_TASK_NAME,
  );
};

export const down: Migration = async ({ context: sequelize }) => {
  // reverts migration
  const queryinterface = sequelize.getQueryInterface();

  await queryinterface.renameColumn(
    // rename task name to activity name
    NEW_TASKTEMPLATES_TABLE,
    NEW_TASK_NAME,
    OLD_TASK_NAME,
  );

  await queryinterface.renameColumn(
    // rename taskid back to activityid col
    NEW_TASKS_TABLE,
    NEW_ID_COL,
    OLD_ID_COL,
  );

  await queryinterface.renameTable(
    // rename tasktemplate table back to activity types
    NEW_TASKTEMPLATES_TABLE,
    OLD_TASKTEMPLATES_TABLE,
  );

  await queryinterface.renameTable(
    // rename tasks table back to activites
    NEW_TASKS_TABLE,
    OLD_TASKS_TABLE,
  );
};
