import { Migration } from "../umzug";

const TABLE_NAME = "pets";

export const up: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  // Allow sex column to be nullable and remove any default value
  await queryInterface.sequelize.query(
    `ALTER TABLE ${TABLE_NAME} 
      ALTER COLUMN sex DROP NOT NULL,
      ALTER COLUMN sex DROP DEFAULT;`,
  );
};

export const down: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  // Before restoring NOT NULL, fill any nulls introduced after the up migration ran
  await queryInterface.sequelize.query(
    `UPDATE ${TABLE_NAME} SET sex = 'F' WHERE sex IS NULL;`,
  );
  // Revert: set sex to NOT NULL and add default 'F'
  await queryInterface.sequelize.query(
    `ALTER TABLE ${TABLE_NAME}
      ALTER COLUMN sex SET DEFAULT 'F',
      ALTER COLUMN sex SET NOT NULL;`,
  );
};
