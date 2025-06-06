import { DataType } from "sequelize-typescript";
import { Migration } from "../umzug";

const TABLE_NAME = "users";
const COLUMN_NAME = "animal_tags";

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().addColumn(TABLE_NAME, COLUMN_NAME, {
    type: DataType.ARRAY(
      DataType.ENUM("Bird", "Bunny", "Cat", "Dog", "Small Animal"),
    ),
    allowNull: true,
  });

  // temporarily allows null values to handle migrations
  await sequelize.query(`
  UPDATE "${TABLE_NAME}" 
  SET "${COLUMN_NAME}" = '{}'
  WHERE "${COLUMN_NAME}" IS NULL;
  `);
  // set default for array value
  await sequelize.query(`
    ALTER TABLE "${TABLE_NAME}" 
    ALTER COLUMN "${COLUMN_NAME}" SET DEFAULT '{}',
    ALTER COLUMN "${COLUMN_NAME}" SET NOT NULL;
  `);
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().removeColumn(TABLE_NAME, COLUMN_NAME);
  await sequelize.query(`DROP TYPE IF EXISTS enum_users_animal_tags;`);
};
