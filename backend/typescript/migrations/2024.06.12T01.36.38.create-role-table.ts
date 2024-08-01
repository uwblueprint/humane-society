// TODO: DEPRECATED, LEAVING FOR FUTURE REFERENCE

import { DataType } from "sequelize-typescript";

import { Migration } from "../umzug";

const TABLE_NAME = "roles";

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable(TABLE_NAME, {
    id: {
      type: DataType.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    role_name: {
      type: DataType.STRING,
      allowNull: false,
    },
  });

  await sequelize
    .getQueryInterface()
    .bulkInsert(TABLE_NAME, [
      { role_name: "Administrator" },
      { role_name: "Animal Behaviourist" },
      { role_name: "Staff" },
      { role_name: "Volunteer" },
    ]);
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().dropTable(TABLE_NAME);
};
