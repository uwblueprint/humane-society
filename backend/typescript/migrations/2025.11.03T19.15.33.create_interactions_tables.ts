import { DataTypes } from "sequelize";
import type { MigrationFn } from "umzug";

export const up: MigrationFn = async (params: any) => {
  const context = params.context;
  const queryInterface =
    context.getQueryInterface?.() ?? context;

  await queryInterface.createTable("interaction_types", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    action_type: { type: DataTypes.STRING, allowNull: false },
  });

  await queryInterface.createTable("interactions", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    actor_id: { type: DataTypes.INTEGER, allowNull: false },
    target_user_id: { type: DataTypes.INTEGER },
    target_pet_id: { type: DataTypes.INTEGER },
    target_task_id: { type: DataTypes.INTEGER },
    target_task_template_id: { type: DataTypes.INTEGER },
    interaction_type_id: { type: DataTypes.INTEGER, allowNull: false },
    metadata: { type: DataTypes.ARRAY(DataTypes.STRING) },
    short_description: { type: DataTypes.STRING },
    long_description: { type: DataTypes.STRING },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });
};

export const down: MigrationFn = async (params: any) => {
  const context = params.context;
  const queryInterface =
    context.getQueryInterface?.() ?? context;

  await queryInterface.dropTable("interactions");
  await queryInterface.dropTable("interaction_types");
};
