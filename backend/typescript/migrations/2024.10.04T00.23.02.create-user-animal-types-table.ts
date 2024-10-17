import { DataType } from "sequelize-typescript";

import { Migration } from "../umzug";

const TABLE_NAME = "user_animal_types";

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable(TABLE_NAME, {
    user_id: {
      type: DataType.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "users",
        key: "id"
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    animal_type_id: {
      type: DataType.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "animal_types",
        key: "id"
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  });
}

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().dropTable(TABLE_NAME);
};
