import { DataType } from "sequelize-typescript";
import { Migration } from "../umzug";
import { MAX_BEHAVIOUR_LEVEL, MIN_BEHAVIOUR_LEVEL } from "../constants";

const TABLE_NAME = "pet_behaviours";
const CONSTRAINT_NAME = "unique_pet_behaviour";

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().addColumn(TABLE_NAME, "level", {
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: MIN_BEHAVIOUR_LEVEL,
      max: MAX_BEHAVIOUR_LEVEL,
    },
  });

  await sequelize.getQueryInterface().addColumn(TABLE_NAME, "is_highlighted", {
    type: DataType.BOOLEAN,
    allowNull: false,
  });

  await sequelize.getQueryInterface().addConstraint(TABLE_NAME, {
    fields: ["behaviour_id", "pet_id"],
    type: "unique",
    name: CONSTRAINT_NAME,
  });
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().removeColumn(TABLE_NAME, "level");

  await sequelize
    .getQueryInterface()
    .removeColumn(TABLE_NAME, "is_highlighted");
};
