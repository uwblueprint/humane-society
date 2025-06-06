import { DataType } from "sequelize-typescript";

import { Migration } from "../umzug";

const TABLE_NAME = "pet_behaviours";

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable(TABLE_NAME, {
    id: {
      type: DataType.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    pet_id: {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: "pets",
        key: "id",
      },
    },
    behaviour_id: {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: "behaviours",
        key: "id",
      },
    },
    skill_level: {
      type: DataType.INTEGER,
      allowNull: false,
    },
  });
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().dropTable(TABLE_NAME);
};
