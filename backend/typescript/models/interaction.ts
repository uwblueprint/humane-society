import { Sequelize, DataTypes, Model, Optional } from "sequelize";

interface InteractionAttributes {
  id: number;
  actor_id: number;
  target_user_id?: number | null;
  target_pet_id?: number | null;
  target_task_id?: number | null;
  target_task_template_id?: number | null;
  interaction_type_id: number;
  metadata: string[];
  short_description: string;
  long_description: string;
  created_at?: Date;
  updated_at?: Date;
}

type InteractionCreationAttributes = Optional<InteractionAttributes, "id" | "created_at" | "updated_at">;

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  const Interaction = sequelize.define<Model<InteractionAttributes, InteractionCreationAttributes>>(
    "Interaction",
    {
      id: {
        type: dataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      actor_id: {
        type: dataTypes.INTEGER,
        allowNull: false,
      },
      target_user_id: dataTypes.INTEGER,
      target_pet_id: dataTypes.INTEGER,
      target_task_id: dataTypes.INTEGER,
      target_task_template_id: dataTypes.INTEGER,
      interaction_type_id: {
        type: dataTypes.INTEGER,
        allowNull: false,
      },
      metadata: {
        type: dataTypes.ARRAY(dataTypes.STRING),
        allowNull: false,
      },
      short_description: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      long_description: {
        type: dataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "interactions",
      timestamps: false,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Interaction;
};
