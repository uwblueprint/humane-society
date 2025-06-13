import { DataType } from "sequelize-typescript";
import { Migration } from "../umzug";

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable("interaction_type", {
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
    short_description: {
      type: DataType.STRING,
      allowNull: false,
    },
    detailed_description: {
      type: DataType.STRING,
      allowNull: false,
    }
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
      onDelete: "CASCADE",
    },
    target_type: {
      type: DataType.ENUM("users", "pets"),
      allowNull: false,
    },
    target_id: {
      type: DataType.INTEGER,
      allowNull: false,
    },
    interaction_type_id: {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: "interaction_type",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    created_at: {
      type: DataType.DATE,
      allowNull: false,
      defaultValue: DataType.NOW,
    },
    metadata: {
      type: DataType.JSON,
      allowNull: false,
    },
  });

  await sequelize.getQueryInterface().addIndex("interaction_log", ["actor_id"]);
  await sequelize
    .getQueryInterface()
    .addIndex("interaction_log", ["target_type", "target_id"]);
  await sequelize
    .getQueryInterface()
    .addIndex("interaction_log", ["interaction_type_id"]);
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().dropTable("interaction_log");
  await sequelize.getQueryInterface().dropTable("interaction_type");
};
