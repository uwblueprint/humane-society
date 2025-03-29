import { DataType } from "sequelize-typescript";
import { MAX_COLOR_LEVEL, MIN_COLOR_LEVEL } from "../constants";
import { Migration } from "../umzug";

const TABLE_ONE = "users";
const TABLE_TWO = "pets";
const OLD_COLUMN_NAME = "skill_level";
const NEW_COLUMN_NAME = "color_level";
const SKILL_LEVEL_INTERVAL = "skill_level_interval";
const COLOR_LEVEL_INTERVAL = "color_level_interval";

export const up: Migration = async ({ context: sequelize }) => {
  // update users table
  await sequelize
    .getQueryInterface()
    .renameColumn(TABLE_ONE, OLD_COLUMN_NAME, NEW_COLUMN_NAME);
  // handle prior null values
  await sequelize.query(`
    UPDATE "${TABLE_ONE}" 
    SET "${NEW_COLUMN_NAME}" = 5
    WHERE "${NEW_COLUMN_NAME}" IS NULL;
  `);
  await sequelize.getQueryInterface().changeColumn(TABLE_ONE, NEW_COLUMN_NAME, {
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
  });
  await sequelize.query(`
    ALTER TABLE ${TABLE_ONE} ADD CONSTRAINT ${COLOR_LEVEL_INTERVAL} 
    CHECK (color_level BETWEEN ${MIN_COLOR_LEVEL} AND ${MAX_COLOR_LEVEL});
  `);

  // update pets table
  await sequelize
    .getQueryInterface()
    .renameColumn(TABLE_TWO, OLD_COLUMN_NAME, NEW_COLUMN_NAME);
  await sequelize
    .getQueryInterface()
    .removeConstraint(TABLE_TWO, SKILL_LEVEL_INTERVAL);
  await sequelize.query(
    `ALTER TABLE ${TABLE_TWO} ADD CONSTRAINT ${COLOR_LEVEL_INTERVAL} 
    CHECK (color_level BETWEEN ${MIN_COLOR_LEVEL} AND ${MAX_COLOR_LEVEL});`,
  );
};

export const down: Migration = async ({ context: sequelize }) => {
  // pets table
  await sequelize
    .getQueryInterface()
    .removeConstraint(TABLE_TWO, COLOR_LEVEL_INTERVAL);
  await sequelize.query(
    `ALTER TABLE ${TABLE_TWO} ADD CONSTRAINT ${SKILL_LEVEL_INTERVAL} 
    CHECK (color_level BETWEEN ${MIN_COLOR_LEVEL} AND ${MAX_COLOR_LEVEL});`,
  );
  await sequelize
    .getQueryInterface()
    .renameColumn(TABLE_TWO, NEW_COLUMN_NAME, OLD_COLUMN_NAME);

  // users table
  await sequelize
    .getQueryInterface()
    .removeConstraint(TABLE_ONE, COLOR_LEVEL_INTERVAL);
  await sequelize.getQueryInterface().changeColumn("users", "color_level", {
    type: DataType.INTEGER,
    allowNull: true,
  });
  await sequelize
    .getQueryInterface()
    .renameColumn(TABLE_ONE, NEW_COLUMN_NAME, OLD_COLUMN_NAME);
};
