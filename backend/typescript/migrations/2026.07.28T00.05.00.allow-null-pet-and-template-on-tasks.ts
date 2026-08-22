import { DataType } from "sequelize-typescript";
import { Migration } from "../umzug";

const TABLE_NAME = "tasks";

export const up: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();

  await queryInterface.changeColumn(TABLE_NAME, "pet_id", {
    type: DataType.INTEGER,
    allowNull: true,
  });

  await queryInterface.changeColumn(TABLE_NAME, "task_template_id", {
    type: DataType.INTEGER,
    allowNull: true,
  });
};

export const down: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();

  await queryInterface.changeColumn(TABLE_NAME, "pet_id", {
    type: DataType.INTEGER,
    allowNull: false,
  });

  await queryInterface.changeColumn(TABLE_NAME, "task_template_id", {
    type: DataType.INTEGER,
    allowNull: false,
  });
};
