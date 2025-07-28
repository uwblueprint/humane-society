import { DataType } from "sequelize-typescript";
import { Migration } from "../umzug";

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable("interaction_types", {
    id: {
      type: DataType.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    action_type: {
      type: DataType.STRING,
      allowNull: false,
    },
  });

  // Create interaction_log table
  await sequelize.getQueryInterface().createTable("interaction_log", {
    id: {
      type: DataType.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    actor_id: {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
    },
    target_user_id: {
      type: DataType.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
    },
    target_pet_id: {
      type: DataType.INTEGER,
      allowNull: true,
      references: {
        model: "pets",
        key: "id",
      },
      onUpdate: "CASCADE",
    },
    target_task_id: {
      type: DataType.INTEGER,
      allowNull: true,
      references: {
        model: "activities",
        key: "id",
      },
      onUpdate: "CASCADE",
    },
    target_task_template_id: {
      type: DataType.INTEGER,
      allowNull: true,
      references: {
        model: "activity_types",
        key: "id",
      },
      onUpdate: "CASCADE",
    },
    interaction_type_id: {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: "interaction_types",
        key: "id",
      },
      onUpdate: "CASCADE",
    },
    metadata: {
      type: DataType.ARRAY(DataType.STRING),
      allowNull: false,
    },
    short_description: {
      type: DataType.STRING,
      allowNull: false,
    },
    detailed_description: {
      type: DataType.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataType.DATE,
      allowNull: false,
      defaultValue: DataType.NOW,
    },
  });
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().dropTable("interaction_log");
  await sequelize.getQueryInterface().dropTable("interaction_types");
};
