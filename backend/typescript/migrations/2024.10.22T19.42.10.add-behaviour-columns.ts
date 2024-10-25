import { DataType } from "sequelize-typescript";
import { Migration } from "../umzug";

const TABLE_NAME = "behaviours";

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .addColumn(TABLE_NAME, "parent_behaviour_id", {
      type: DataType.INTEGER,
      allowNull: true,
      references: {
        model: "behaviours",
        key: "id",
      },
    });
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .removeColumn(TABLE_NAME, "parent_behaviour_id");
};
