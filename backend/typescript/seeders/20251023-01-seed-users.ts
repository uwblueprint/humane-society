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

    const users: Rec[] = [
      {
        first_name: "John",
        last_name: "Smith",
        auth_id: uidMap.admin_001,
        role: "Administrator",
        email: "john.smith@humanesociety.com",
        color_level: 5,
        animal_tags: "{Dog,Cat}",
        status: "Active",
        can_see_all_logs: true,
        can_assign_users_to_tasks: true,
        phone_number: "+1-555-0101",
      },
      {
        first_name: "Sarah",
        last_name: "Johnson",
        auth_id: uidMap.admin_002,
        role: "Administrator",
        email: "sarah.johnson@humanesociety.com",
        color_level: 5,
        animal_tags: "{Bird,Small Animal}",
        status: "Active",
        can_see_all_logs: true,
        can_assign_users_to_tasks: true,
        phone_number: "+1-555-0102",
      },
      {
        first_name: "Emily",
        last_name: "Wilson",
        auth_id: uidMap.behaviourist_001,
        role: "Animal Behaviourist",
        email: "emily.wilson@humanesociety.com",
        color_level: 5,
        animal_tags: "{Dog,Cat,Small Animal}",
        status: "Active",
        can_see_all_logs: true,
        can_assign_users_to_tasks: false,
        phone_number: "+1-555-0201",
      },
      {
        first_name: "Michael",
        last_name: "Brown",
        auth_id: uidMap.behaviourist_002,
        role: "Animal Behaviourist",
        email: "michael.brown@humanesociety.com",
        color_level: 4,
        animal_tags: "{Bird,Bunny}",
        status: "Active",
        can_see_all_logs: true,
        can_assign_users_to_tasks: false,
        phone_number: "+1-555-0202",
      },
      {
        first_name: "Lisa",
        last_name: "Davis",
        auth_id: uidMap.staff_001,
        role: "Staff",
        email: "lisa.davis@humanesociety.com",
        color_level: 4,
        animal_tags: "{Dog,Cat}",
        status: "Active",
        can_see_all_logs: false,
        can_assign_users_to_tasks: true,
        phone_number: "+1-555-0301",
      },
      {
        first_name: "Robert",
        last_name: "Miller",
        auth_id: uidMap.staff_002,
        role: "Staff",
        email: "robert.miller@humanesociety.com",
        color_level: 3,
        animal_tags: "{Bunny,Small Animal}",
        status: "Active",
        can_see_all_logs: false,
        can_assign_users_to_tasks: true,
        phone_number: "+1-555-0302",
      },
      {
        first_name: "Amanda",
        last_name: "Garcia",
        auth_id: uidMap.volunteer_001,
        role: "Volunteer",
        email: "amanda.garcia@volunteer.com",
        color_level: 2,
        animal_tags: "{Dog}",
        status: "Active",
        can_see_all_logs: false,
        can_assign_users_to_tasks: false,
        phone_number: "+1-555-0401",
      },
      {
        first_name: "Kevin",
        last_name: "Martinez",
        auth_id: uidMap.volunteer_002,
        role: "Volunteer",
        email: "kevin.martinez@volunteer.com",
        color_level: 1,
        animal_tags: "{Cat,Bird}",
        status: "Active",
        can_see_all_logs: false,
        can_assign_users_to_tasks: false,
        phone_number: "+1-555-0402",
      },
    ].map((r) => withTS(r, uTS.createdKey, uTS.updatedKey));

    await queryInterface.bulkInsert(Users, users);
  },

  down: async (queryInterface: QueryInterface) => {
    const Users = await resolveTable(queryInterface, ["Users", "users"]);
    await queryInterface.bulkDelete(Users, {
      auth_id: [
        uidMap.admin_001,
        uidMap.admin_002,
        uidMap.behaviourist_001,
        uidMap.behaviourist_002,
        uidMap.staff_001,
        uidMap.staff_002,
        uidMap.volunteer_001,
        uidMap.volunteer_002,
      ],
    } as any);
  },
};
