import { DataType } from "sequelize-typescript";
import { Migration } from "../umzug";

const OLD_TABLE_NAME = "activities";
const NEW_TABLE_NAME = "activity_types";
const USER_PET_ACTIVITIES_TABLE = "user_pet_activities";
const ACTIVITIES_TABLE = "activities";

export const up: Migration = async ({ context: sequelize }) => {
  // Rename the activities table to activity_types
  await sequelize
    .getQueryInterface()
    .renameTable(OLD_TABLE_NAME, NEW_TABLE_NAME);

  // Change the activity_id column in user_pet_activities to activity_type_id
  await sequelize
    .getQueryInterface()
    .renameColumn(USER_PET_ACTIVITIES_TABLE, "activity_id", "activity_type_id");

  // Update the references for activity_type_id to point to the new activity_types table
  await sequelize
    .getQueryInterface()
    .changeColumn(USER_PET_ACTIVITIES_TABLE, "activity_type_id", {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: NEW_TABLE_NAME, // Reference the new table name
        key: "id",
      },
    });

  // Change the name of user_pet_activities to activities
  await sequelize
    .getQueryInterface()
    .renameTable(USER_PET_ACTIVITIES_TABLE, ACTIVITIES_TABLE);
};

export const down: Migration = async ({ context: sequelize }) => {
  // Rename the activities table back to user_pet_activities
  await sequelize
    .getQueryInterface()
    .renameTable(ACTIVITIES_TABLE, USER_PET_ACTIVITIES_TABLE);

  // Rename the activity_types table back to activities
  await sequelize
    .getQueryInterface()
    .renameTable(NEW_TABLE_NAME, OLD_TABLE_NAME);

  // Revert the activity_type_id column back to activity_id
  await sequelize
    .getQueryInterface()
    .renameColumn(USER_PET_ACTIVITIES_TABLE, "activity_type_id", "activity_id");

  // Revert the activity_id column to reference the old activities table
  await sequelize
    .getQueryInterface()
    .changeColumn(USER_PET_ACTIVITIES_TABLE, "activity_id", {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: OLD_TABLE_NAME, // Revert back to the old table name
        key: "id",
      },
    });
};
