/* eslint-disable */
import type { QueryInterface } from "sequelize";
import { resolveTable, tsKeys, withTS, Rec } from "../utilities/_utils";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const Templates = await resolveTable(queryInterface, [
      "task_templates",
      "TaskTemplates",
      "Task_Templates",
      "taskTemplates",
    ]);
    const ttTS = await tsKeys(queryInterface, Templates);

    // Load template fixtures
    const FIXTURES: Array<{
      task_name: string;
      category: string;
      instruction: string;
    }> = require("./mockData/templates.json");

    const templates: Rec[] = FIXTURES.map((r) =>
      withTS(r, ttTS.createdKey, ttTS.updatedKey)
    );

    await queryInterface.bulkInsert(Templates, templates);
  },

  down: async (queryInterface: QueryInterface) => {
    const Templates = await resolveTable(queryInterface, [
      "task_templates",
      "TaskTemplates",
      "Task_Templates",
      "taskTemplates",
    ]);
    const FIXTURES: Array<{ task_name: string }> = require("./mockData/templates.json");
    await queryInterface.bulkDelete(Templates, {
      task_name: FIXTURES.map((f) => f.task_name),
    } as any);
  },
};
