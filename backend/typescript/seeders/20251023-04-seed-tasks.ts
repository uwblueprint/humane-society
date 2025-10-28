/* eslint-disable */
import type { QueryInterface } from "sequelize";
import { resolveTable, tsKeys, withTS, Rec } from "../utilities/_utils";

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
    const Pets = await resolveTable(queryInterface, ["Pets", "pets"]);
    const Templates = await resolveTable(queryInterface, [
      "task_templates",
      "TaskTemplates",
      "Task_Templates",
      "taskTemplates",
    ]);
    const Tasks = await resolveTable(queryInterface, ["tasks", "Tasks"]);
    const tkTS = await tsKeys(queryInterface, Tasks);

    // Look up FK IDs dynamically (no hardcoded numbers)
    const [userRows]: any = await queryInterface.sequelize.query(
      `SELECT id, auth_id FROM "${Users}" WHERE auth_id IN (:ids)`,
      {
        replacements: {
          ids: [
            uidMap.volunteer_001,
            uidMap.staff_001,
            uidMap.behaviourist_001,
            uidMap.volunteer_002,
          ],
        },
      },
    );
    const [petRows]: any = await queryInterface.sequelize.query(
      `SELECT id, name FROM "${Pets}" WHERE name IN ('Buddy','Whiskers','Bella','Polly','Snowball')`,
    );
    const [tmplRows]: any = await queryInterface.sequelize.query(
      `SELECT id, task_name FROM "${Templates}"`,
    );

    const idOf = (arr: any[], key: string, val: string) =>
      (arr.find((x) => x[key] === val) || {}).id ?? null;

    const tasks: Rec[] = [
      {
        user_id: idOf(userRows, "auth_id", uidMap.volunteer_001),
        pet_id: idOf(petRows, "name", "Buddy"),
        task_template_id: idOf(tmplRows, "task_name", "Morning Dog Walk"),
        scheduled_start_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
        notes: "seed_Morning Dog Walk_Buddy",
      },
      {
        user_id: idOf(userRows, "auth_id", uidMap.staff_001),
        pet_id: idOf(petRows, "name", "Whiskers"),
        task_template_id: idOf(tmplRows, "task_name", "Cage Cleaning"),
        scheduled_start_time: new Date(Date.now() + 2 * 60 * 60 * 1000),
        start_time: new Date(),
        notes: "seed_Cage Cleaning_Whiskers",
      },
      {
        user_id: idOf(userRows, "auth_id", uidMap.behaviourist_001),
        pet_id: idOf(petRows, "name", "Bella"),
        task_template_id: idOf(tmplRows, "task_name", "Basic Training Session"),
        scheduled_start_time: new Date(Date.now() + 4 * 60 * 60 * 1000),
        notes: "seed_Basic Training Session_Bella",
      },
      {
        user_id: null,
        pet_id: idOf(petRows, "name", "Polly"),
        task_template_id: idOf(tmplRows, "task_name", "Interactive Play Time"),
        scheduled_start_time: new Date(Date.now() + 6 * 60 * 60 * 1000),
        notes: "seed_Interactive Play Time_Polly",
      },
      {
        user_id: idOf(userRows, "auth_id", uidMap.volunteer_002),
        pet_id: idOf(petRows, "name", "Snowball"),
        task_template_id: idOf(tmplRows, "task_name", "Socialization Activity"),
        scheduled_start_time: new Date(Date.now() + 8 * 60 * 60 * 1000),
        notes: "seed_Socialization Activity_Snowball",
      },
    ].map((r) => withTS(r, tkTS.createdKey, tkTS.updatedKey));

    await queryInterface.bulkInsert(Tasks, tasks);
  },

  down: async (queryInterface: QueryInterface) => {
    const Tasks = await resolveTable(queryInterface, ["tasks", "Tasks"]);
    await queryInterface.sequelize.query(
      `DELETE FROM "${Tasks}" WHERE notes LIKE 'seed_%'`,
    );
  },
};
