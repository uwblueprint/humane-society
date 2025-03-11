import { DataType } from "sequelize-typescript";
import { MIN_COLOR_LEVEL, MAX_COLOR_LEVEL } from "../constants";
import { Migration } from "../umzug";

const TABLE_NAME = "users";
const OLD_COLUMN_NAME = "skill_level";
const NEW_COLUMN_NAME = "color_level";
const COLOR_LEVEL_INTERVAL = "color_level_interval"

export const up: Migration = async ({ context: sequelize }) => {
    await sequelize.getQueryInterface().renameColumn(TABLE_NAME, OLD_COLUMN_NAME, NEW_COLUMN_NAME);
    await sequelize.getQueryInterface().changeColumn(TABLE_NAME, NEW_COLUMN_NAME, {
        type: DataType.ENUM,
        allowNull: false,
        defaultValue: 5,
    });
    await sequelize.getQueryInterface().addConstraint(TABLE_NAME, {
        name: COLOR_LEVEL_INTERVAL,
        fields: [NEW_COLUMN_NAME],
        type: 'check',
        where: { 
            color_level: {
                $between: [MIN_COLOR_LEVEL, MAX_COLOR_LEVEL]
            }
        }
    })
};

export const down: Migration = async ({ context: sequelize }) => {
    await sequelize.getQueryInterface().removeConstraint(TABLE_NAME, COLOR_LEVEL_INTERVAL);
    await sequelize.getQueryInterface().changeColumn(TABLE_NAME, NEW_COLUMN_NAME, {
        type: DataType.INTEGER, 
        allowNull: true,
    });
    await sequelize.getQueryInterface().renameColumn(TABLE_NAME, NEW_COLUMN_NAME, OLD_COLUMN_NAME);
};