import { Migration } from "../umzug";
import { SYSTEM_USER_AUTH_ID } from "../types";

const TABLE_NAME = "users";

export const up: Migration = async ({ context: sequelize }) => {
  const now = new Date();
  // bulkInsert can't determine the element type of an empty array, so this
  // row is inserted with a raw query that explicitly casts animal_tags;
  // every other column can be inferred from the target column as usual.
  await sequelize.query(
    `
    INSERT INTO "${TABLE_NAME}"
      (first_name, last_name, auth_id, role, email, color_level, animal_tags, status, "createdAt", "updatedAt")
    VALUES
      (:firstName, :lastName, :authId, :role, :email, :colorLevel, ARRAY[]::"enum_users_animal_tags"[], :status, :now, :now)
    `,
    {
      replacements: {
        firstName: "System",
        lastName: "User",
        authId: SYSTEM_USER_AUTH_ID,
        role: "Administrator",
        email: "system@internal",
        colorLevel: 1,
        status: "Active",
        now,
      },
    },
  );
};

export const down: Migration = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .bulkDelete(TABLE_NAME, { auth_id: SYSTEM_USER_AUTH_ID }, {});
};
