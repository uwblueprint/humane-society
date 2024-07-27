import { DataType } from "sequelize-typescript";
import { Migration } from "../umzug";

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().addColumn("users", "status", {
    type: DataType.ENUM("Active", "Inactive"),
    allowNull: false,
  });
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().removeColumn("users", "status");
  await sequelize.query(`DROP TYPE IF EXISTS enum_users_status;`);
};
