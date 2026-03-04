import { DataTypes } from "sequelize";
import { Migration } from "../umzug";

export const up: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  await queryInterface.createTable("interaction_types", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    action_type: { type: DataTypes.STRING, allowNull: false },
  });

  await queryInterface.createTable("interactions", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    actor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
    },
    target_user_id: {
      type: DataTypes.INTEGER,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    target_pet_id: {
      type: DataTypes.INTEGER,
      references: { model: "pets", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    target_task_id: {
      type: DataTypes.INTEGER,
      references: { model: "tasks", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    target_task_template_id: {
      type: DataTypes.INTEGER,
      references: { model: "task_templates", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    interaction_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "interaction_types", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    metadata: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false },
    short_description: { type: DataTypes.STRING, allowNull: false },
    long_description: { type: DataTypes.STRING, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });
};

export const down: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();

  await queryInterface.dropTable("interactions");
  await queryInterface.dropTable("interaction_types");
};
