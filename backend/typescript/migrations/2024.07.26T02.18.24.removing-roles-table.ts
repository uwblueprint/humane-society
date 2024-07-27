import { DataType } from "sequelize-typescript";

import { Migration } from "../umzug";

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().removeColumn("users", "role_id");
  await sequelize.getQueryInterface().addColumn("users", "role", {
    type: DataType.ENUM(
      "Administrator",
      "Animal Behaviourist",
      "Staff",
      "Volunteer",
    ),
    allowNull: false,
  });

  await sequelize.getQueryInterface().dropTable("roles");
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable("roles", {
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
    .bulkInsert("roles", [
      { role_name: "Administrator" },
      { role_name: "Animal Behaviourist" },
      { role_name: "Staff" },
      { role_name: "Volunteer" },
    ]);

  await sequelize.getQueryInterface().addColumn("users", "role_id", {
    type: DataType.INTEGER,
    allowNull: true,
    references: {
      model: "roles",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });

  await sequelize.getQueryInterface().removeColumn("users", "role");
};
