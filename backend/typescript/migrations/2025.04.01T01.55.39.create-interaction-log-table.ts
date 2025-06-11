import { DataType } from "sequelize-typescript";

import { Migration } from "../umzug";

const TABLE_NAME = "interaction_log";

export const up: Migration = async ({ context: sequelize }) => {
    await sequelize.getQueryInterface().createTable(TABLE_NAME, {
        id: {
            type: DataType.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        actor_id: {
            type: DataType.INTEGER,
            allowNull: true,
            references: {
                model: "users",
                key: "id"
            },
        },
        target_pet_id: {
            type: DataType.INTEGER,
            allowNull: true,
            references: {
                model: "pets",
                key: "id",
            }
        },
        target_user_id: {
            type: DataType.INTEGER,
            allowNull: true,
            references: {
                model: "users",
                key: "id",
            }
        },
        target_activity_id: {
            type: DataType.INTEGER,
            allowNull: true,
            references: {
                model: "activities",
                key: "id",
            }
        },
        interaction_type_id: {
            type: DataType.INTEGER,
            allowNull: false,
            references: {
                model: "interaction_log_types",
                key: "id",
            }
        },
        metadata: {
            type: DataType.JSON,
            allowNull: true,
        },
        created_at: {
            type: DataType.DATE,
            allowNull: false,
        },
    });
};

export const down: Migration = async ({ context: sequelize }) => {
    await sequelize.getQueryInterface().dropTable(TABLE_NAME);
};

