import type { QueryInterface } from "sequelize";
import { resolveTable, tsKeys, withTS, Rec } from "../utilities/_utils";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const Templates = await resolveTable(queryInterface, ["task_templates", "TaskTemplates", "Task_Templates", "taskTemplates"]);
    const ttTS = await tsKeys(queryInterface, Templates);

    const templates: Rec[] = [
      { task_name: "Morning Dog Walk",      category: "Walk",      instruction: "Take the dog for a 30-minute walk around the grounds." },
      { task_name: "Cage Cleaning",         category: "Husbandry", instruction: "Clean and disinfect living space; refresh bowls and bedding." },
      { task_name: "Basic Training Session",category: "Training",  instruction: "15-minute obedience session: sit, stay, come." },
      { task_name: "Interactive Play Time", category: "Games",     instruction: "20-minute enrichment with toys; monitor stress levels." },
      { task_name: "Socialization Activity",category: "Pen Time",  instruction: "30-minute supervised interaction with compatible animals." },
    ].map(r => withTS(r, ttTS.createdKey, ttTS.updatedKey));

    await queryInterface.bulkInsert(Templates, templates);
  },

  down: async (queryInterface: QueryInterface) => {
    const Templates = await resolveTable(queryInterface, ["task_templates", "TaskTemplates", "Task_Templates", "taskTemplates"]);
    await queryInterface.bulkDelete(Templates, {
      task_name: ["Morning Dog Walk","Cage Cleaning","Basic Training Session","Interactive Play Time","Socialization Activity"],
    } as any);
  },
};
