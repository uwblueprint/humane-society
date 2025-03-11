import { DataType } from "sequelize-typescript";
import { Migration } from "../umzug";

const TABLE_NAME = "users";
const COLUMN_NAME = "profile_photo";

export const up: Migration = async ({ context: sequelize }) => {
    await sequelize.getQueryInterface().addColumn(TABLE_NAME, COLUMN_NAME, {
        type: DataType.STRING,
       allowNull: true,
    });
};

export const down: Migration = async ({ context: sequelize }) => {
    await sequelize.getQueryInterface().removeColumn(TABLE_NAME, COLUMN_NAME);
};