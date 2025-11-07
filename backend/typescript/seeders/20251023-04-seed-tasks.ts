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

    // Load task fixtures
    const FIXTURES: Array<{
      userLabel: string | null;
      petName: string;
      templateName: string;
      offsetHours?: number;
      startNow?: boolean;
      notes: string;
    }> = require("./mockData/tasks.json");

    // Look up FK IDs dynamically (no hardcoded numbers)
    const userAuthIds: string[] = Array.from(
      new Set(
        FIXTURES
          .map((f) => f.userLabel)
          .filter((x): x is string => Boolean(x))
          .map((label) => uidMap[label])
      )
    );
    const petNames: string[] = Array.from(
      new Set(FIXTURES.map((f) => f.petName))
    );

    const [userRows]: any = await queryInterface.sequelize.query(
      `SELECT id, auth_id FROM "${Users}" WHERE auth_id IN (:ids)`,
      { replacements: { ids: userAuthIds } },
    );
    const [petRows]: any = await queryInterface.sequelize.query(
      `SELECT id, name FROM "${Pets}" WHERE name IN (:names)`,
      { replacements: { names: petNames } },
    );
    const [tmplRows]: any = await queryInterface.sequelize.query(
      `SELECT id, task_name FROM "${Templates}"`,
    );

    const idOf = (arr: any[], key: string, val: string) =>
      (arr.find((x) => x[key] === val) || {}).id ?? null;

    const tasks: Rec[] = FIXTURES.map((f) => {
      const scheduled = new Date(
        Date.now() + ((f.offsetHours ?? 0) * 60 * 60 * 1000)
      );
      const base: any = {
        user_id: f.userLabel ? idOf(userRows, "auth_id", uidMap[f.userLabel]) : null,
        pet_id: idOf(petRows, "name", f.petName),
        task_template_id: idOf(tmplRows, "task_name", f.templateName),
        scheduled_start_time: scheduled,
        notes: f.notes,
      };
      if (f.startNow) base.start_time = new Date();
      return base;
    }).map((r) => withTS(r, tkTS.createdKey, tkTS.updatedKey));

    await queryInterface.bulkInsert(Tasks, tasks);
  },

  down: async (queryInterface: QueryInterface) => {
    const Tasks = await resolveTable(queryInterface, ["tasks", "Tasks"]);
    await queryInterface.sequelize.query(
      `DELETE FROM "${Tasks}" WHERE notes LIKE 'seed_%'`,
    );
  },
};
