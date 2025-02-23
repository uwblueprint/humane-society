import { DataType } from "sequelize-typescript";
import { Migration } from "../umzug";
import { Category } from "../types";

const TABLE_NAME = "activity_types";

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().addColumn(TABLE_NAME, "category", {
    type: DataType.ENUM(...Object.values(Category)),
    allowNull: false,
    defaultValue: Category.MISC,
  });
  await sequelize.getQueryInterface().addColumn(TABLE_NAME, "instruction", {
    type: DataType.TEXT,
    allowNull: true,
  });
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().removeColumn(TABLE_NAME, "category");
  await sequelize.getQueryInterface().removeColumn(TABLE_NAME, "instruction");
  // delete category enum, otherwise causes issues with migrating up, down, then up
  await sequelize
    .getQueryInterface()
    .sequelize.query('DROP TYPE IF EXISTS "enum_activity_types_category";');
};
