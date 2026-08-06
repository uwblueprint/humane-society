import { DataType } from "sequelize-typescript";
import { Migration } from "../umzug";

const TABLE_NAME = "pets";

export const up: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();

  await queryInterface.removeColumn(TABLE_NAME, "status");
  await queryInterface.sequelize.query(
    'DROP TYPE IF EXISTS "enum_pets_status";',
  );
};

export const down: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();

  await queryInterface.addColumn(TABLE_NAME, "status", {
    type: DataType.ENUM("Occupied", "Needs Care", "Does Not Need Care"),
    allowNull: false,
    defaultValue: "Needs Care",
  });
};
