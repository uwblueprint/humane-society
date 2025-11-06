import { Sequelize, DataTypes, Model, Optional } from "sequelize";

interface InteractionTypeAttributes {
  id: number;
  action_type: string;
}

// define type for creation
type InteractionTypeCreationAttributes = Optional<InteractionTypeAttributes, "id">;

// export model factory
export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  const InteractionType = sequelize.define<Model<InteractionTypeAttributes, InteractionTypeCreationAttributes>>(
    "InteractionType",
    {
      id: {
        type: dataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      action_type: {
        type: dataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "interaction_types",
      timestamps: false,
    }
  );

  return InteractionType;
};
