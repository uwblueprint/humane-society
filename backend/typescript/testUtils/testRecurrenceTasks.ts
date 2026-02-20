import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../../.env') });

import { sequelize } from '../models';
import TaskService from '../services/implementations/taskService';
import { AnimalTag, Cadence, PetStatus, TaskCategory } from '../types';
import { dayIndexToName } from '../utilities/dateUtils';
import PetService from '../services/implementations/petService';
import TaskTemplateService from '../services/implementations/taskTemplateService';

const DATABASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.DATABASE_URL!
    : `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST || process.env.DB_HOST}:5432/${process.env.POSTGRES_DB_TEST}`;

console.log('=== Environment Variables ===');
console.log('POSTGRES_DB_DEV:', process.env.POSTGRES_DB_DEV);
console.log('POSTGRES_DB_TEST:', process.env.POSTGRES_DB_TEST);
console.log('POSTGRES_USER:', process.env.POSTGRES_USER);
console.log('POSTGRES_PASSWORD:', process.env.POSTGRES_PASSWORD);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('POSTGRES_HOST:', process.env.POSTGRES_HOST);
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('=============================\n');

type DayIdx = 0 | 1 | 2 | 3 | 4 | 5 | 6;

async function testTaskService() {
  await sequelize.sync();
  const taskService = new TaskService();
  const petService = new PetService();
  const taskTemplateService = new TaskTemplateService();

  const today = new Date();
  const pet = await petService.createPet({
    name: "Test Pet",
    animalTag: AnimalTag.CAT,
    colorLevel: 1,
    status: PetStatus.OCCUPIED,
    sex: "M",
  });
  const taskTemplate = await taskTemplateService.createTaskTemplate({
    taskName: "Test Task Template",
    category: TaskCategory.HUSBANDRY,
  });

  console.log("=== Testing TaskService Recurrence Methods ===");
  
  const task = {
    petId: pet.id,
    taskTemplateId: taskTemplate.id,
    scheduledStartTime: today,
  };

  const newTask = await taskService.createTask(task);

  const created = await taskService.createRecurrence(
    newTask.id.toString(),
    Cadence.WEEKLY,
    [dayIndexToName[today.getDay() as DayIdx]],
    new Date(new Date().setFullYear(new Date().getFullYear() + 1))
  );
  console.log("CREATED RECURRENCE TASK:", created);
  
  const retrieved = await taskService.getRecurrence(created.id.toString());
  console.log("RETRIEVED RECURRENCE TASK:", retrieved);
  
  const tomorrowsDayIndex = (today.getDay() + 1) % 7;
  const updated = await taskService.updateRecurrence(created.id.toString(), { cadence: Cadence.BIWEEKLY, days: (created.days ?? []).concat([dayIndexToName[tomorrowsDayIndex as DayIdx]]) });
  console.log("UPDATED RECURRENCE TASK:", updated);
  
  const excluded = await taskService.excludeDate(created.id.toString(), new Date(new Date().setDate(new Date().getDate() + 1)));
  console.log("EXCLUDED RECURRENCE TASK:", excluded);
  
  // const invalidExclusion = await taskService.excludeDate(
  //   created.id.toString(),
  //   new Date(new Date().setDate(new Date().getDate() + 2))
  // ).catch((err) => {
  //   console.log("INVALID EXCLUDED RECURRENCE TASK:", err.message, invalidExclusion);
  //   // should throw err and exit script
  // });
  
  const generatedInstance = await taskService.generateRecurringInstanceForData(created.id.toString(), new Date());

  const actualTaskFromGeneratedInstance = await taskService.getTask(newTask.id.toString());
  console.log("GENERATED RECURRENCE INSTANCE:", generatedInstance);
  console.log("ACTUAL TASK FROM GENERATED INSTANCE:", actualTaskFromGeneratedInstance);

  // const excludedRecurringInstance = await taskService.generateRecurringInstanceForData(
  //   created.id.toString(),
  //   new Date(new Date().setDate(new Date().getDate() + 1))
  // ).catch((err) => {
  //   console.log("INVALID GENERATED RECURRENCE INSTANCE:", err.message, excludedRecurringInstance);
  //   // should throw err and exit script
  // });

  // const earlierDatedRecurringInstance = await taskService.generateRecurringInstanceForData(
  //   created.id.toString(),
  //   new Date(new Date().setDate(new Date().getDate() - 1)) // date is one day earlier, thus invalid
  // ).catch((err) => {
  //   console.log("EARLIER DATED RECURRENCING INSTANCE:", err.message, earlierDatedRecurringInstance);
  //   // should throw err and exit script
  // });

  // const laterDatedRecurringInstance = await taskService.generateRecurringInstanceForData(
  //   created.id.toString(),
  //   new Date(new Date().setFullYear(new Date().getFullYear() + 2)) 
  // ).catch((err) => {
  //   console.log("LATER DATED RECURRENCING INSTANCE:", err.message, laterDatedRecurringInstance);
  //   // should throw err and exit script
  // });
  
  // const notInRecurrencePattern = await taskService.generateRecurringInstanceForData(
  //   created.id.toString(),
  //   new Date(new Date().setDate(new Date().getDate() + 5))
  // ).catch((err) => {
  //   console.log("NOT IN RECURRENCE PATTERN:", err.message, notInRecurrencePattern);
  //   // should throw err and exit script
  // });

  const deleted = await taskService.deleteRecurrence(created.id.toString());
  console.log("DELETED RECURRENCE TASK:", deleted);
  await sequelize.close();
}

testTaskService();
