import { DataType } from "sequelize-typescript";
import { Migration } from "../umzug";

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .addColumn("behaviours", "parent_behaviour_id", {
      type: DataType.INTEGER,
      allowNull: true,
    });
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .removeColumn("behaviours", "parent_behaviour_id");
};
