// TODO: DEPRECATED, LEAVING FOR FUTURE REFERENCE

import { DataType } from "sequelize-typescript";
import { Migration } from "../umzug";

export const up: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();

  await queryInterface.addColumn("users", "role_id", {
    type: DataType.INTEGER,
    allowNull: false,
    references: {
      model: "roles",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });

  await queryInterface.removeColumn("users", "role");
  await sequelize.query(`DROP TYPE IF EXISTS enum_users_role;`);
};

export const down: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();

  await queryInterface.removeColumn("users", "role_id");
};
