import { testSql } from "../testUtils/testDb";
import PgTask from "../models/task.model";
import PgPet from "../models/pet.model";
import PgTaskTemplate from "../models/taskTemplate.model";
import TaskService from "../services/implementations/taskService";
import { AnimalTag, PetStatus, TaskCategory } from "../types";

describe("recurring task deletion scoping (integration, real DB)", () => {
  const taskService = new TaskService();
  let petId: number;
  let templateId: number;

  beforeEach(async () => {
    await testSql.sync({ force: true });

    const pet = await PgPet.create({
      name: "Rex",
      animal_tag: AnimalTag.DOG,
      status: PetStatus.NEEDS_CARE,
      color_level: 1,
    });
    petId = pet.id;

    const template = await PgTaskTemplate.create({
      task_name: "Walk",
      category: TaskCategory.WALK,
    });
    templateId = template.id;
  });

  afterAll(async () => {
    await testSql.sync({ force: true });
    await testSql.close();
  });

  it("truncating a series from date X deletes only that series' override rows on/after X", async () => {
    const seed = await PgTask.create({
      pet_id: petId,
      task_template_id: templateId,
      scheduled_start_time: new Date("2026-06-02T12:00:00Z"),
    });

    const overrideBefore = await taskService.createTask({
      petId,
      taskTemplateId: templateId,
      scheduledStartTime: new Date("2026-06-09T12:00:00Z"),
      parentTaskId: seed.id,
    });

    const overrideAfter = await taskService.createTask({
      petId,
      taskTemplateId: templateId,
      scheduledStartTime: new Date("2026-08-11T12:00:00Z"),
      parentTaskId: seed.id,
    });

    await taskService.deleteSeriesOverrides(
      seed.id,
      new Date("2026-08-01T00:00:00Z"),
    );

    expect(await PgTask.findByPk(seed.id)).not.toBeNull();
    expect(await PgTask.findByPk(overrideBefore.id)).not.toBeNull();
    expect(await PgTask.findByPk(overrideAfter.id)).toBeNull();
  });

  it("an unrelated one-time task with the same pet and template after X survives", async () => {
    const seed = await PgTask.create({
      pet_id: petId,
      task_template_id: templateId,
      scheduled_start_time: new Date("2026-06-02T12:00:00Z"),
    });

    const oneTimeTask = await taskService.createTask({
      petId,
      taskTemplateId: templateId,
      scheduledStartTime: new Date("2026-08-20T12:00:00Z"),
    });

    await taskService.deleteSeriesOverrides(
      seed.id,
      new Date("2026-08-01T00:00:00Z"),
    );

    expect(await PgTask.findByPk(oneTimeTask.id)).not.toBeNull();
  });

  it("a second series of the same template for the same pet survives, both its seed and its override rows", async () => {
    const truncatedSeed = await PgTask.create({
      pet_id: petId,
      task_template_id: templateId,
      scheduled_start_time: new Date("2026-06-02T12:00:00Z"),
    });

    const otherSeed = await PgTask.create({
      pet_id: petId,
      task_template_id: templateId,
      scheduled_start_time: new Date("2026-06-03T12:00:00Z"),
    });
    const otherSeedOverride = await taskService.createTask({
      petId,
      taskTemplateId: templateId,
      scheduledStartTime: new Date("2026-08-15T12:00:00Z"),
      parentTaskId: otherSeed.id,
    });

    await taskService.deleteSeriesOverrides(
      truncatedSeed.id,
      new Date("2026-08-01T00:00:00Z"),
    );

    expect(await PgTask.findByPk(otherSeed.id)).not.toBeNull();
    expect(await PgTask.findByPk(otherSeedOverride.id)).not.toBeNull();
  });

  it("deleting a full series removes all of its override rows", async () => {
    const seed = await PgTask.create({
      pet_id: petId,
      task_template_id: templateId,
      scheduled_start_time: new Date("2026-06-02T12:00:00Z"),
    });
    const overrideOne = await taskService.createTask({
      petId,
      taskTemplateId: templateId,
      scheduledStartTime: new Date("2026-06-09T12:00:00Z"),
      parentTaskId: seed.id,
    });
    const overrideTwo = await taskService.createTask({
      petId,
      taskTemplateId: templateId,
      scheduledStartTime: new Date("2026-08-20T12:00:00Z"),
      parentTaskId: seed.id,
    });

    await taskService.deleteTask(seed.id.toString());

    expect(await PgTask.findByPk(seed.id)).toBeNull();
    expect(await PgTask.findByPk(overrideOne.id)).toBeNull();
    expect(await PgTask.findByPk(overrideTwo.id)).toBeNull();
  });

  it("occurrences before X remain visible with their history intact", async () => {
    const seed = await PgTask.create({
      pet_id: petId,
      task_template_id: templateId,
      scheduled_start_time: new Date("2026-06-02T12:00:00Z"),
    });
    const completedOverride = await taskService.createTask({
      petId,
      taskTemplateId: templateId,
      scheduledStartTime: new Date("2026-06-09T12:00:00Z"),
      startTime: new Date("2026-06-09T12:05:00Z"),
      endTime: new Date("2026-06-09T12:30:00Z"),
      notes: "completed walk",
      parentTaskId: seed.id,
    });

    await taskService.deleteSeriesOverrides(
      seed.id,
      new Date("2026-08-01T00:00:00Z"),
    );

    const survivor = await PgTask.findByPk(completedOverride.id);
    expect(survivor).not.toBeNull();
    expect(survivor?.notes).toBe("completed walk");
    expect(survivor?.end_time).toEqual(new Date("2026-06-09T12:30:00Z"));
  });
});
