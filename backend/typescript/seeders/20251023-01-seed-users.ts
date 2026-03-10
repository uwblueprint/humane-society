/* eslint-disable */
import type { QueryInterface } from "sequelize";
import { resolveTable, tsKeys, withTS, Rec } from "../utilities/_utils";

// Pull real UIDs created by `yarn seed:auth`
let uidMap: Record<string, string>;
try {
  uidMap = require("./seed-auth-map.json");
} catch {
  throw new Error(
    "seed-auth-map.json not found. Run `docker compose exec ts-backend yarn seed:auth` first.",
  );
}

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const Users = await resolveTable(queryInterface, ["Users", "users"]);
    const uTS = await tsKeys(queryInterface, Users);

    // Load user fixtures
    const FIXTURES: Array<{
      label: string;
      first_name: string;
      last_name: string;
      role: string;
      email: string;
      color_level: number;
      animal_tags: string;
      status: string;
      can_see_all_logs: boolean;
      can_assign_users_to_tasks: boolean;
      phone_number: string;
    }> = require("./mockData/users.json");

    const users: Rec[] = FIXTURES.map((f) => ({
      ...f,
      auth_id: uidMap[f.label],
    }))
      .map((r) => {
        const { label, ...rest } = r;
        return rest;
      })
      .map((r) => withTS(r, uTS.createdKey, uTS.updatedKey));

    await queryInterface.bulkInsert(Users, users);
  },

  down: async (queryInterface: QueryInterface) => {
    const Users = await resolveTable(queryInterface, ["Users", "users"]);
    const FIXTURES: Array<{ label: string }> = require("./mockData/users.json");
    await queryInterface.bulkDelete(Users, {
      auth_id: FIXTURES.map((f) => uidMap[f.label]),
    } as any);
  },
};
