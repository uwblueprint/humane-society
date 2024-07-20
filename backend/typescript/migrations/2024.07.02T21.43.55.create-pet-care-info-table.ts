import { DataType } from "sequelize-typescript";

import { Migration } from "../umzug";

const TABLE_NAME = "pet_care_info";

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable(TABLE_NAME, {
    id: {
      type: DataType.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    pet_id: {
      type: DataType.INTEGER,
      references: {
        model: "pets",
      },
      unique: true,
      onDelete: "CASCADE",
      allowNull: false,
    },
    safety_info: {
      type: DataType.TEXT,
      allowNull: true,
    },
    medical_info: {
      type: DataType.TEXT,
      allowNull: true,
    },
    management_info: {
      type: DataType.TEXT,
      allowNull: true,
    },
  });
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().dropTable(TABLE_NAME);
};
