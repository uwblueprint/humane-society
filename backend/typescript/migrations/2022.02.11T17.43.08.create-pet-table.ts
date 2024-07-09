import { DataType } from "sequelize-typescript";

import { Migration } from "../umzug";

const TABLE_NAME = "pets";

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable(TABLE_NAME, {
    id: {
      type: DataType.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    animal_type_id: {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: "animal_types",
        key: "id",
      },
    },
    name: {
      type: DataType.STRING,
      allowNull: false,
    },
    status: {
      type: DataType.ENUM(
        "Assigned",
        "Active",
        "Needs Care",
        "Does Not Need Care",
      ),
      allowNull: false,
    },
    breed: {
      type: DataType.STRING,
      allowNull: false,
    },
    age: {
      type: DataType.INTEGER,
      allowNull: false,
    },
    adoption_status: {
      type: DataType.BOOLEAN,
      allowNull: false,
    },
    pet_care_info_id: {
      type: DataType.INTEGER,
      allowNull: true,
      onDelete: "SET NULL",
    },
    weight: {
      type: DataType.DECIMAL,
      allowNull: false,
    },
    neutered: {
      type: DataType.BOOLEAN,
      allowNull: false,
    },
    sex: {
      type: DataType.ENUM("M", "F"),
      allowNull: false,
    },
    photo: {
      type: DataType.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataType.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataType.DATE,
      allowNull: true,
    },
  });
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().dropTable(TABLE_NAME);
};
