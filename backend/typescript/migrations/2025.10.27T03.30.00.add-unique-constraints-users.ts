/* eslint-disable */
import type { QueryInterface, Sequelize } from "sequelize";

const TABLE = "users";
const UQ_EMAIL = "users_email_unique";
const UQ_AUTH_ID = "users_auth_id_unique";

module.exports = {
  up: async (queryInterface: QueryInterface, _sequelize: Sequelize) => {
    await queryInterface.sequelize.transaction(async (t) => {
    // adding unique constraints
      await queryInterface.addConstraint(TABLE, {
        fields: ["email"],
        type: "unique",
        name: UQ_EMAIL,
        transaction: t,
      });
      await queryInterface.addConstraint(TABLE, {
        fields: ["auth_id"],
        type: "unique",
        name: UQ_AUTH_ID,
        transaction: t,
      });
    });
  },

  down: async (queryInterface: QueryInterface, _sequelize: Sequelize) => {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.removeConstraint(TABLE, UQ_AUTH_ID, { transaction: t });
      await queryInterface.removeConstraint(TABLE, UQ_EMAIL, { transaction: t });
    });
  },
};
