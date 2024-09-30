import { DataType } from "sequelize-typescript";

import { Migration } from "../umzug";
import { teamRoleValues } from "../types";

const TABLE_NAME = "team_members";

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable(TABLE_NAME, {
    id: {
      type: DataType.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    first_name: {
      type: DataType.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataType.STRING,
      allowNull: false,
    },
    role: {
      type: DataType.ENUM,
      values: teamRoleValues,
      allowNull: false,
    },
  });
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().dropTable(TABLE_NAME);
};
