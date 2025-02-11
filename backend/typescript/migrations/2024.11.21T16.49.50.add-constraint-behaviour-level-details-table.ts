import { Migration } from "../umzug";
import { MAX_BEHAVIOUR_LEVEL, MIN_BEHAVIOUR_LEVEL } from "../constants";

const TABLE_NAME = "behaviour_level_details";
const CONSTRAINT_NAME = "level_interval";

export const up: Migration = async ({ context: sequelize }) => {
  await sequelize.query(
    `ALTER TABLE ${TABLE_NAME} ADD CONSTRAINT ${CONSTRAINT_NAME} 
    CHECK (level BETWEEN ${MIN_BEHAVIOUR_LEVEL} AND ${MAX_BEHAVIOUR_LEVEL});`,
  );
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize.query(
    `ALTER TABLE ${TABLE_NAME} DROP CONSTRAINT ${CONSTRAINT_NAME};`,
  );
};
