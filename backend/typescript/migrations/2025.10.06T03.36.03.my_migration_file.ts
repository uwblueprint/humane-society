import { DataTypes, QueryInterface } from "sequelize";
import { Migration } from "../umzug";
import { teamRoleValues } from "../types";

const TABLE_NAME = "team_members";

export const up: Migration = async ({ context }: { context: { getQueryInterface: () => QueryInterface } }) => {
  await context.getQueryInterface().createTable(TABLE_NAME, {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    team_role: {
      type: DataTypes.ENUM(...teamRoleValues),
      allowNull: false,
    },
  });
};

export const down: Migration = async ({ context }: { context: { getQueryInterface: () => QueryInterface } }) => {
  await context.getQueryInterface().dropTable(TABLE_NAME);
};
