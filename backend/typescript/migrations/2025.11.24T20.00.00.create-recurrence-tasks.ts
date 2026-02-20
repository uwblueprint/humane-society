import { DataType } from "sequelize-typescript";

import { Migration } from "../umzug";
import { Cadence, Days } from "../types";

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
      type: DataType.ARRAY(DataType.ENUM(...Object.values(Days))),
      allowNull: true,
    },

    cadence: {
      type: DataType.ENUM(...Object.values(Cadence)),
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
    },

    updated_at: {
      type: DataType.DATE,
      allowNull: true,
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
