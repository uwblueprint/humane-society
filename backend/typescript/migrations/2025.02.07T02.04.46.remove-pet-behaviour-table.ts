import { DataType } from "sequelize-typescript";
import { MIN_BEHAVIOUR_LEVEL, MAX_BEHAVIOUR_LEVEL } from "../constants";
import { Migration } from "../umzug";

const TABLE_NAME = "pet_behaviours";
const CONSTRAINT_NAME = "unique_pet_behaviour";
const CONSTRAINT_NAME_2 = "skill_level_interval";

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .removeConstraint(TABLE_NAME, CONSTRAINT_NAME);

  await sequelize
    .getQueryInterface()
    .removeColumn(TABLE_NAME, "is_highlighted");

  await sequelize.query(
    `ALTER TABLE ${TABLE_NAME} DROP CONSTRAINT ${CONSTRAINT_NAME_2};`,
  );

  await sequelize.getQueryInterface().dropTable(TABLE_NAME);
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable(TABLE_NAME, {
    id: {
      type: DataType.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    pet_id: {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: "pets",
        key: "id",
      },
    },
    behaviour_id: {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: "behaviours",
        key: "id",
      },
    },
    skill_level: {
      type: DataType.INTEGER,
      allowNull: false,
    },
  });

  await sequelize.getQueryInterface().addColumn(TABLE_NAME, "is_highlighted", {
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  });

  await sequelize.getQueryInterface().addConstraint(TABLE_NAME, {
    fields: ["behaviour_id", "pet_id"],
    type: "unique",
    name: CONSTRAINT_NAME,
  });

  await sequelize.query(
    `ALTER TABLE ${TABLE_NAME} ADD CONSTRAINT ${CONSTRAINT_NAME_2} 
    CHECK (skill_level BETWEEN ${MIN_BEHAVIOUR_LEVEL} AND ${MAX_BEHAVIOUR_LEVEL});`,
  );
};
