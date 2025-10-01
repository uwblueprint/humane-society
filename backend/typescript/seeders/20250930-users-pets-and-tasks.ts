import type { QueryInterface } from "sequelize";

type Rec = Record<string, any>;

async function resolveTable(queryInterface: QueryInterface, candidates: string[]) {
  for (const name of candidates) {
    try { await queryInterface.describeTable(name); return name; } catch {}
  }
  throw new Error(`None of the table candidates exist: ${candidates.join(", ")}`);
}

async function tsKeys(queryInterface: QueryInterface, table: string) {
  const cols = await queryInterface.describeTable(table);
  const createdKey = cols["createdAt"] ? "createdAt" : (cols["created_at"] ? "created_at" : undefined);
  const updatedKey = cols["updatedAt"] ? "updatedAt" : (cols["updated_at"] ? "updated_at" : undefined);
  return { createdKey, updatedKey };
}

function withTS(r: Rec, createdKey?: string, updatedKey?: string) {
  const now = new Date();
  if (createdKey) r[createdKey] = now;
  if (updatedKey) r[updatedKey] = now;
  return r;
}

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const t = await queryInterface.sequelize.transaction();
    try {
      const usersTable = await resolveTable(queryInterface, ["Users", "users"]);
      const petsTable = await resolveTable(queryInterface, ["Pets", "pets"]);
      const templatesTable = await resolveTable(queryInterface, ["task_templates", "TaskTemplates", "Task_Templates", "taskTemplates"]);
      const tasksTable = await resolveTable(queryInterface, ["tasks", "Tasks"]);

      const uTS = await tsKeys(queryInterface, usersTable);
      const pTS = await tsKeys(queryInterface, petsTable);
      const ttTS = await tsKeys(queryInterface, templatesTable);
      const tkTS = await tsKeys(queryInterface, tasksTable);

      const users: Rec[] = [
        { first_name: "John", last_name: "Smith", auth_id: "admin_001", role: "Administrator", email: "john.smith@humanesociety.com", color_level: 5, animal_tags: "{Dog,Cat}", status: "Active", can_see_all_logs: true, can_assign_users_to_tasks: true, phone_number: "+1-555-0101" },
        { first_name: "Sarah", last_name: "Johnson", auth_id: "admin_002", role: "Administrator", email: "sarah.johnson@humanesociety.com", color_level: 5, animal_tags: "{Bird,Small Animal}", status: "Active", can_see_all_logs: true, can_assign_users_to_tasks: true, phone_number: "+1-555-0102" },
        { first_name: "Emily", last_name: "Wilson", auth_id: "behaviourist_001", role: "Animal Behaviourist", email: "emily.wilson@humanesociety.com", color_level: 5, animal_tags: "{Dog,Cat,Small Animal}", status: "Active", can_see_all_logs: true, can_assign_users_to_tasks: false, phone_number: "+1-555-0201" },
        { first_name: "Michael", last_name: "Brown", auth_id: "behaviourist_002", role: "Animal Behaviourist", email: "michael.brown@humanesociety.com", color_level: 4, animal_tags: "{Bird,Bunny}", status: "Active", can_see_all_logs: true, can_assign_users_to_tasks: false, phone_number: "+1-555-0202" },
        { first_name: "Lisa", last_name: "Davis", auth_id: "staff_001", role: "Staff", email: "lisa.davis@humanesociety.com", color_level: 4, animal_tags: "{Dog,Cat}", status: "Active", can_see_all_logs: false, can_assign_users_to_tasks: true, phone_number: "+1-555-0301" },
        { first_name: "Robert", last_name: "Miller", auth_id: "staff_002", role: "Staff", email: "robert.miller@humanesociety.com", color_level: 3, animal_tags: "{Bunny,Small Animal}", status: "Active", can_see_all_logs: false, can_assign_users_to_tasks: true, phone_number: "+1-555-0302" },
        { first_name: "Amanda", last_name: "Garcia", auth_id: "volunteer_001", role: "Volunteer", email: "amanda.garcia@volunteer.com", color_level: 2, animal_tags: "{Dog}", status: "Active", can_see_all_logs: false, can_assign_users_to_tasks: false, phone_number: "+1-555-0401" },
        { first_name: "Kevin", last_name: "Martinez", auth_id: "volunteer_002", role: "Volunteer", email: "kevin.martinez@volunteer.com", color_level: 1, animal_tags: "{Cat,Bird}", status: "Active", can_see_all_logs: false, can_assign_users_to_tasks: false, phone_number: "+1-555-0402" },
      ].map(r => withTS(r, uTS.createdKey, uTS.updatedKey));

      await queryInterface.bulkInsert(usersTable, users, { transaction: t });

      const pets: Rec[] = [
        { animal_tag: "Dog", name: "Buddy", status: "Needs Care", breed: "Golden Retriever", birthday: "2022-03-15", weight: 65, color_level: 2, sex: "M" },
        { animal_tag: "Dog", name: "Luna", status: "Does Not Need Care", breed: "Labrador Mix", birthday: "2021-07-22", weight: 55, color_level: 3, sex: "F" },
        { animal_tag: "Dog", name: "Max", status: "Occupied", breed: "German Shepherd", birthday: "2020-11-08", weight: 75, color_level: 4, sex: "M" },
        { animal_tag: "Dog", name: "Bella", status: "Needs Care", breed: "Border Collie", birthday: "2023-01-30", weight: 45, color_level: 1, sex: "F" },
        { animal_tag: "Dog", name: "Charlie", status: "Does Not Need Care", breed: "Beagle", birthday: "2022-09-12", weight: 25, color_level: 2, sex: "M" },

        { animal_tag: "Cat", name: "Whiskers", status: "Needs Care", breed: "Domestic Shorthair", birthday: "2022-05-20", weight: 10, color_level: 1, sex: "M" },
        { animal_tag: "Cat", name: "Mittens", status: "Does Not Need Care", breed: "Persian", birthday: "2021-12-03", weight: 12, color_level: 2, sex: "F" },
        { animal_tag: "Cat", name: "Shadow", status: "Occupied", breed: "Maine Coon", birthday: "2020-08-15", weight: 18, color_level: 3, sex: "M" },
        { animal_tag: "Cat", name: "Princess", status: "Needs Care", breed: "Siamese", birthday: "2023-02-28", weight: 8, color_level: 1, sex: "F" },
        { animal_tag: "Cat", name: "Tiger", status: "Does Not Need Care", breed: "Tabby", birthday: "2022-06-10", weight: 11, color_level: 2, sex: "M" },

        { animal_tag: "Bird", name: "Polly", status: "Needs Care", breed: "African Grey Parrot", birthday: "2019-04-12", weight: 1.5, color_level: 4, sex: "F" },
        { animal_tag: "Bird", name: "Rio", status: "Does Not Need Care", breed: "Cockatiel", birthday: "2021-10-05", weight: 0.3, color_level: 2, sex: "M" },
        { animal_tag: "Bird", name: "Sunny", status: "Occupied", breed: "Canary", birthday: "2022-01-18", weight: 0.2, color_level: 1, sex: "F" },
        { animal_tag: "Bird", name: "Kiwi", status: "Needs Care", breed: "Budgerigar", birthday: "2023-03-22", weight: 0.15, color_level: 1, sex: "M" },
        { animal_tag: "Bird", name: "Phoenix", status: "Does Not Need Care", breed: "Lovebird", birthday: "2022-07-14", weight: 0.25, color_level: 2, sex: "F" },

        { animal_tag: "Bunny", name: "Snowball", status: "Needs Care", breed: "Holland Lop", birthday: "2022-04-25", weight: 3, color_level: 1, sex: "F" },
        { animal_tag: "Bunny", name: "Cocoa", status: "Does Not Need Care", breed: "Netherland Dwarf", birthday: "2021-11-30", weight: 2.5, color_level: 2, sex: "M" },
        { animal_tag: "Bunny", name: "Pepper", status: "Occupied", breed: "Mini Rex", birthday: "2023-01-08", weight: 4, color_level: 1, sex: "F" },
        { animal_tag: "Bunny", name: "Oreo", status: "Does Not Need Care", breed: "English Angora", birthday: "2022-08-17", weight: 5, color_level: 3, sex: "M" },
        { animal_tag: "Bunny", name: "Honey", status: "Does Not Need Care", breed: "Flemish Giant", birthday: "2021-06-03", weight: 12, color_level: 2, sex: "F" },

        { animal_tag: "Small Animal", name: "Peanut", status: "Needs Care", breed: "Guinea Pig", birthday: "2022-12-12", weight: 1.2, color_level: 1, sex: "M" },
        { animal_tag: "Small Animal", name: "Nibbles", status: "Does Not Need Care", breed: "Hamster", birthday: "2023-04-08", weight: 0.15, color_level: 1, sex: "F" },
        { animal_tag: "Small Animal", name: "Squeaky", status: "Occupied", breed: "Rat", birthday: "2022-10-20", weight: 0.5, color_level: 2, sex: "M" },
        { animal_tag: "Small Animal", name: "Patches", status: "Needs Care", breed: "Guinea Pig", birthday: "2023-02-14", weight: 1.1, color_level: 1, sex: "F" },
        { animal_tag: "Small Animal", name: "Gizmo", status: "Does Not Need Care", breed: "Chinchilla", birthday: "2021-09-25", weight: 0.8, color_level: 3, sex: "M" },
      ].map(r => withTS(r, pTS.createdKey, pTS.updatedKey));

      await queryInterface.bulkInsert(petsTable, pets, { transaction: t });

      const templates: Rec[] = [
        { task_name: "Morning Dog Walk", category: "Walk", instruction: "Take the dog for a 30-minute walk around the grounds." },
        { task_name: "Cage Cleaning", category: "Husbandry", instruction: "Clean and disinfect living space; refresh bowls and bedding." },
        { task_name: "Basic Training Session", category: "Training", instruction: "15-minute obedience session: sit, stay, come." },
        { task_name: "Interactive Play Time", category: "Games", instruction: "20-minute enrichment with toys; monitor stress levels." },
        { task_name: "Socialization Activity", category: "Pen Time", instruction: "30-minute supervised interaction with compatible animals." },
      ].map(r => withTS(r, ttTS.createdKey, ttTS.updatedKey));

      await queryInterface.bulkInsert(templatesTable, templates, { transaction: t });

      const [userRows]: any = await queryInterface.sequelize.query(
        `SELECT id, auth_id FROM "${usersTable}" WHERE auth_id IN ('volunteer_001','staff_001','behaviourist_001','volunteer_002')`,
        { transaction: t }
      );
      const [petRows]: any = await queryInterface.sequelize.query(
        `SELECT id, name FROM "${petsTable}" WHERE name IN ('Buddy','Whiskers','Bella','Polly','Snowball')`,
        { transaction: t }
      );
      const [tmplRows]: any = await queryInterface.sequelize.query(
        `SELECT id, task_name FROM "${templatesTable}"`,
        { transaction: t }
      );

      const idOf = (arr: any[], key: string, val: string) => {
        const f = arr.find(x => x[key] === val);
        return f ? f.id : null;
        };

      const tasks: Rec[] = [
        { user_id: idOf(userRows, "auth_id", "volunteer_001"), pet_id: idOf(petRows, "name", "Buddy"), task_template_id: idOf(tmplRows, "task_name", "Morning Dog Walk"), scheduled_start_time: new Date(Date.now() + 24 * 60 * 60 * 1000), notes: "seed_Morning Dog Walk_Buddy" },
        { user_id: idOf(userRows, "auth_id", "staff_001"), pet_id: idOf(petRows, "name", "Whiskers"), task_template_id: idOf(tmplRows, "task_name", "Cage Cleaning"), scheduled_start_time: new Date(Date.now() + 2 * 60 * 60 * 1000), start_time: new Date(), notes: "seed_Cage Cleaning_Whiskers" },
        { user_id: idOf(userRows, "auth_id", "behaviourist_001"), pet_id: idOf(petRows, "name", "Bella"), task_template_id: idOf(tmplRows, "task_name", "Basic Training Session"), scheduled_start_time: new Date(Date.now() + 4 * 60 * 60 * 1000), notes: "seed_Basic Training Session_Bella" },
        { user_id: null, pet_id: idOf(petRows, "name", "Polly"), task_template_id: idOf(tmplRows, "task_name", "Interactive Play Time"), scheduled_start_time: new Date(Date.now() + 6 * 60 * 60 * 1000), notes: "seed_Interactive Play Time_Polly" },
        { user_id: idOf(userRows, "auth_id", "volunteer_002"), pet_id: idOf(petRows, "name", "Snowball"), task_template_id: idOf(tmplRows, "task_name", "Socialization Activity"), scheduled_start_time: new Date(Date.now() + 8 * 60 * 60 * 1000), notes: "seed_Socialization Activity_Snowball" },
      ].map(r => withTS(r, tkTS.createdKey, tkTS.updatedKey));

      await queryInterface.bulkInsert(tasksTable, tasks, { transaction: t });

      await t.commit();
    } catch (e) {
      try { await (queryInterface.sequelize.transaction() as any).rollback(); } catch {}
      throw e;
    }
  },

  down: async (queryInterface: QueryInterface) => {
    const usersTable = await resolveTable(queryInterface, ["Users", "users"]);
    const petsTable = await resolveTable(queryInterface, ["Pets", "pets"]);
    const templatesTable = await resolveTable(queryInterface, ["task_templates", "TaskTemplates", "Task_Templates", "taskTemplates"]);
    const tasksTable = await resolveTable(queryInterface, ["tasks", "Tasks"]);

    await queryInterface.sequelize.query(`DELETE FROM "${tasksTable}" WHERE notes LIKE 'seed_%'`);
    await queryInterface.bulkDelete(templatesTable, { task_name: ["Morning Dog Walk","Cage Cleaning","Basic Training Session","Interactive Play Time","Socialization Activity"] } as any);
    await queryInterface.bulkDelete(petsTable, { name: ["Buddy","Luna","Max","Bella","Charlie","Whiskers","Mittens","Shadow","Princess","Tiger","Polly","Rio","Sunny","Kiwi","Phoenix","Snowball","Cocoa","Pepper","Oreo","Honey","Peanut","Nibbles","Squeaky","Patches","Gizmo"] } as any);
    await queryInterface.bulkDelete(usersTable, { auth_id: ["admin_001","admin_002","behaviourist_001","behaviourist_002","staff_001","staff_002","volunteer_001","volunteer_002"] } as any);
  },
};
