import { QueryInterface } from "sequelize";
import { faker } from "@faker-js/faker";

interface ActivitySeedData {
  user_id?: number;
  pet_id: number;
  activity_type_id: number;
  scheduled_start_time?: Date;
  start_time?: Date;
  end_time?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export = {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    // Create 30 activities using hardcoded IDs that should exist
    // after users, pets, and activity types are seeded
    const activities: ActivitySeedData[] = [];

    // Create 30 activities with varied statuses
    Array.from({ length: 30 }, (_, i) => i).forEach(() => {
      // Assume we have 8 users (IDs 1-8), 25 pets (IDs 1-25), and 9 activity types (IDs 1-9)
      const randomUserId = Math.floor(Math.random() * 8) + 1;
      const randomPetId = Math.floor(Math.random() * 25) + 1;
      const randomActivityTypeId = Math.floor(Math.random() * 9) + 1;

      const scheduledTime = faker.date.future();
      const isCompleted = Math.random() > 0.6; // 40% completed activities
      const isStarted = isCompleted || Math.random() > 0.7; // Some started but not completed

      const startTime = isStarted
        ? faker.date.between({
            from: faker.date.recent({ days: 7 }),
            to: new Date(),
          })
        : undefined;

      const endTime =
        isCompleted && startTime
          ? faker.date.between({
              from: startTime,
              to: new Date(startTime.getTime() + 2 * 60 * 60 * 1000), // Max 2 hours later
            })
          : undefined;

      activities.push({
        user_id: Math.random() > 0.1 ? randomUserId : undefined, // 10% unassigned
        pet_id: randomPetId,
        activity_type_id: randomActivityTypeId,
        scheduled_start_time: scheduledTime,
        start_time: startTime,
        end_time: endTime,
        notes: isCompleted ? faker.lorem.sentence() : undefined,
        created_at: new Date(),
        updated_at: new Date(),
      });
    });

    await queryInterface.bulkInsert("activities", activities);
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.bulkDelete("activities", {}, {});
  },
};
