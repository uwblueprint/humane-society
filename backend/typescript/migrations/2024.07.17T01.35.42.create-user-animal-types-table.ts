import { DataType } from "sequelize-typescript";

import { Migration } from "../umzug";

const TABLE_NAME = "user_animal_types";

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable(TABLE_NAME, {
    user_id: {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    animal_type_id: {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: "animal_types",
        key: "id",
      },
    },
  });
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().dropTable(TABLE_NAME);
};
