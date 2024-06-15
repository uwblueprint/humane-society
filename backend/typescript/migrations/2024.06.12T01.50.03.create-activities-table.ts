import { DataType } from "sequelize-typescript";

import { Migration } from "../umzug";

const TABLE_NAME = "activities";

export const up: Migration = async ({ context: sequelize }) => {
    await sequelize.getQueryInterface().createTable(TABLE_NAME, {
        activity_id: {
          type: DataType.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        activity_name: {
          type: DataType.STRING,
          allowNull: false,
        },
        createdAt: DataType.DATE,
        updatedAt: DataType.DATE,
      });
};

export const down: Migration = async ({ context: sequelize }) => {
    await sequelize.getQueryInterface().dropTable(TABLE_NAME);
};