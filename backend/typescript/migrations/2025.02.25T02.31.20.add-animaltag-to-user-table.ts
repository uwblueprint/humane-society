import { DataType } from "sequelize-typescript";
import { Migration } from "../umzug";

const TABLE_NAME = "users";
const COLUMN_NAME = "animal_tags";

export const up: Migration = async ({ context: sequelize }) => {
    await sequelize.getQueryInterface().addColumn(TABLE_NAME, COLUMN_NAME, {
        type: DataType.ARRAY(DataType.ENUM("Bird", "Bunny", "Cat", "Dog", "Hamster")),
       allowNull: true,
    });
};

export const down: Migration = async ({ context: sequelize }) => {
    await sequelize.getQueryInterface().removeColumn(TABLE_NAME, COLUMN_NAME);
};