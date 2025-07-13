import { DataType } from "sequelize-typescript";

import { Migration } from "../umzug";

const TABLE_NAME = "user_pet_tasks";

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable(TABLE_NAME, {
    id: {
      type: DataType.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataType.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    pet_id: {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: "pets",
        key: "id",
      },
    },
    task_id: {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: "tasks",
        key: "id",
      },
    },
    scheduled_start_time: {
      type: DataType.DATE,
      allowNull: true,
    },
    start_time: {
      type: DataType.DATE,
      allowNull: true,
    },
    end_time: {
      type: DataType.DATE,
      allowNull: true,
    },
    notes: {
      type: DataType.TEXT,
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
  await sequelize.getQueryInterface().dropTable(TABLE_NAME);
};
