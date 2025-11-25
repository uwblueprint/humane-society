import { DataType } from "sequelize-typescript";

import { Migration } from "../umzug";

const TABLE_NAME = "recurrence_tasks";

export const up: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();

  await queryInterface.createTable(TABLE_NAME, {
    task_id: {
      type: DataType.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "tasks",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    days: {
      type: DataType.ARRAY(
        DataType.ENUM("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"),
      ),
      allowNull: true,
    },

    cadence: {
      type: DataType.ENUM("Weekly", "Biweekly", "Monthly", "Annually"),
      allowNull: false,
    },

    end_date: {
      type: DataType.DATE,
      allowNull: true,
    },

    exclusions: {
      type: DataType.ARRAY(DataType.DATE),
      allowNull: true,
    },

    created_at: {
      type: DataType.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("NOW()"),
    },

    updated_at: {
      type: DataType.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("NOW()"),
    },
  });
};

export const down: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();

  await queryInterface.dropTable(TABLE_NAME);

  await queryInterface.sequelize.query(
    `DROP TYPE IF EXISTS "enum_recurrence_tasks_days";`,
  );
  await queryInterface.sequelize.query(
    `DROP TYPE IF EXISTS "enum_recurrence_tasks_cadence";`,
  );
};
