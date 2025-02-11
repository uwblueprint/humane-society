import { DataType } from "sequelize-typescript";

import { Migration } from "../umzug";

const TABLE_NAME = "behaviours";

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .removeColumn(TABLE_NAME, "parent_behaviour_id");
  await sequelize.getQueryInterface().dropTable("behaviours");
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable(TABLE_NAME, {
    id: {
      type: DataType.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    behaviour_name: {
      type: DataType.STRING,
      allowNull: false,
    },
  });

  await sequelize
    .getQueryInterface()
    .addColumn(TABLE_NAME, "parent_behaviour_id", {
      type: DataType.INTEGER,
      allowNull: true,
      references: {
        model: "behaviours",
        key: "id",
      },
    });
};
