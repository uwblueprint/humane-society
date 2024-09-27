import { Migration } from '../umzug';
import { DataType } from "sequelize-typescript";

const TABLE_NAME = "team_members";

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable(TABLE_NAME, {
    id: {
      type: DataType.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataType.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataType.STRING,
      allowNull: false,
    },
    teamRole: {
      type: DataType.ENUM("PM", "DESIGNER", "PL", "DEVELOPER"),
      allowNull: false,
    }
  });
};


export const down: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().dropTable(TABLE_NAME);
};