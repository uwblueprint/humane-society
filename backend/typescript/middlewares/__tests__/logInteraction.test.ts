import { Request } from "express";

import logInteraction from "../logInteraction";
import Interaction from "../../models/interaction.model";
import InteractionType from "../../models/interactionType.model";
import PgUser from "../../models/user.model";
import PgPet from "../../models/pet.model";
import {
  AnimalTag,
  InteractionTypeEnum,
  PetStatus,
  Role,
  UserStatus,
} from "../../types";

import { testSql } from "../../testUtils/testDb";

// logInteraction reads everything off req.body; build a minimal Express-like req.
const makeReq = (body: Record<string, unknown>): Request =>
  ({ body } as unknown as Request);

const createUser = (email: string) =>
  PgUser.create({
    first_name: "Test",
    last_name: "Actor",
    auth_id: email,
    role: Role.STAFF,
    email,
    color_level: 5,
    animal_tags: [],
    status: UserStatus.ACTIVE,
  });

describe("logInteraction middleware", () => {
  let actorId: number;
  let targetUserId: number;
  let petId: number;

  beforeEach(async () => {
    await testSql.sync({ force: true });

    // sync() only builds the schema; the interaction_types rows normally come
    // from a seeder migration, so seed them here for getInteractionTypeId().
    await InteractionType.bulkCreate(
      Object.values(InteractionTypeEnum).map((action_type) => ({
        action_type,
      })),
    );

    const actor = await createUser("actor@test.com");
    actorId = actor.id;

    const targetUser = await createUser("target@test.com");
    targetUserId = targetUser.id;

    const pet = await PgPet.create({
      animal_tag: AnimalTag.DOG,
      name: "Rex",
      status: PetStatus.NEEDS_CARE,
      color_level: 1,
    });
    petId = pet.id;
  });

  afterAll(async () => {
    await testSql.sync({ force: true });
    await testSql.close();
  });

  it("DELETED_PET writes one row with target_pet_id NULL and actor set", async () => {
    await logInteraction(
      makeReq({
        actorId,
        targetId: 999999, // pet no longer exists
        interactionType: InteractionTypeEnum.DELETED_PET,
        animalTag: "Dog",
        petName: "Ghost",
      }),
    );

    const rows = await Interaction.findAll();
    expect(rows).toHaveLength(1);
    expect(rows[0].target_pet_id ?? null).toBeNull();
    expect(rows[0].actor_id).toEqual(actorId);
  });

  it("DELETED_USER writes a row with target_user_id NULL", async () => {
    await logInteraction(
      makeReq({
        actorId,
        targetId: 999999,
        interactionType: InteractionTypeEnum.DELETED_USER,
        targetName: "Gone User",
      }),
    );

    const rows = await Interaction.findAll();
    expect(rows).toHaveLength(1);
    expect(rows[0].target_user_id ?? null).toBeNull();
  });

  it("DELETED_TASK_TEMPLATE writes a row with target_task_template_id NULL", async () => {
    await logInteraction(
      makeReq({
        actorId,
        targetId: 999999,
        interactionType: InteractionTypeEnum.DELETED_TASK_TEMPLATE,
        taskTemplateName: "Old Template",
      }),
    );

    const rows = await Interaction.findAll();
    expect(rows).toHaveLength(1);
    expect(rows[0].target_task_template_id ?? null).toBeNull();
  });

  it("CHANGED_PET_NEUTER_STATUS with empty oldText logs a 'Set' row", async () => {
    await logInteraction(
      makeReq({
        actorId,
        targetId: petId,
        interactionType: InteractionTypeEnum.CHANGED_PET_NEUTER_STATUS,
        petName: "Rex",
        oldText: "",
        newText: "Neutered",
      }),
    );

    const rows = await Interaction.findAll();
    expect(rows).toHaveLength(1);
    expect(rows[0].short_description.startsWith("Set")).toBe(true);
  });

  it("CHANGED_PET_SAFETY_INFO first-time set (empty oldText) logs an 'Added' row", async () => {
    await logInteraction(
      makeReq({
        actorId,
        targetId: petId,
        interactionType: InteractionTypeEnum.CHANGED_PET_SAFETY_INFO,
        petName: "Rex",
        oldText: "",
        newText: "Bites when startled",
      }),
    );

    const rows = await Interaction.findAll();
    expect(rows).toHaveLength(1);
    expect(rows[0].short_description.startsWith("Added")).toBe(true);
  });

  it("CHANGED_PET_SAFETY_INFO clear (empty newText) logs a 'Removed' row", async () => {
    await logInteraction(
      makeReq({
        actorId,
        targetId: petId,
        interactionType: InteractionTypeEnum.CHANGED_PET_SAFETY_INFO,
        petName: "Rex",
        oldText: "Bites when startled",
        newText: "",
      }),
    );

    const rows = await Interaction.findAll();
    expect(rows).toHaveLength(1);
    expect(rows[0].short_description.startsWith("Removed")).toBe(true);
  });

  it("CHANGED_USER_NAME (non-delete) writes a row and populates target_user_id", async () => {
    await logInteraction(
      makeReq({
        actorId,
        targetId: targetUserId,
        interactionType: InteractionTypeEnum.CHANGED_USER_NAME,
        oldUserName: "Old Name",
        newUserName: "New Name",
        targetName: "New Name",
      }),
    );

    const rows = await Interaction.findAll();
    expect(rows).toHaveLength(1);
    expect(rows[0].target_user_id).toEqual(targetUserId);
  });

  it("silently no-ops (no throw, no row) when actorId is missing", async () => {
    await expect(
      logInteraction(
        makeReq({
          targetId: 999999,
          interactionType: InteractionTypeEnum.DELETED_USER,
          targetName: "Gone User",
        }),
      ),
    ).resolves.toBeUndefined();

    const count = await Interaction.count();
    expect(count).toEqual(0);
  });
});
