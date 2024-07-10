import { DataType } from "sequelize-typescript";
import { Migration } from "../umzug";

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().addColumn("users", "email", {
    type: DataType.STRING,
    allowNull: false,
  });

  await sequelize.getQueryInterface().addColumn("users", "skill_level", {
    type: DataType.INTEGER,
    allowNull: true,
  });

  await sequelize.getQueryInterface().addColumn("users", "can_see_all_logs", {
    type: DataType.BOOLEAN,
    allowNull: true,
  });

  await sequelize
    .getQueryInterface()
    .addColumn("users", "can_assign_users_to_tasks", {
      type: DataType.BOOLEAN,
      allowNull: true,
    });

  await sequelize.getQueryInterface().addColumn("users", "phone_number", {
    type: DataType.STRING,
    allowNull: true,
  });
};

export const down: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();

  await queryInterface.removeColumn("users", "email");
  await queryInterface.removeColumn("users", "skill_level");
  await queryInterface.removeColumn("users", "can_see_all_logs");
  await queryInterface.removeColumn("users", "can_assign_users_to_tasks");
  await queryInterface.removeColumn("users", "phone_number");
};
