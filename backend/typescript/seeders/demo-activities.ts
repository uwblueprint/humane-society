import { QueryInterface, QueryTypes } from "sequelize";
import { faker } from "@faker-js/faker";

export = {
  up: async (queryInterface: QueryInterface): Promise<unknown> => {
    // Get seeded users
    const users: Array<{
      id: number;
    }> = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE email LIKE '%@seeded.com'",
      { type: QueryTypes.SELECT },
    );

    // If no seeded users exist, we'll create activities without user_id
    const userIds = users.length > 0 ? users.map((user) => user.id) : [null];

    // Get seeded pets
    const pets: Array<{
      id: number;
    }> = await queryInterface.sequelize.query(
      "SELECT id FROM pets WHERE name LIKE '%Seeded%'",
      { type: QueryTypes.SELECT },
    );

    // Get activity types
    const activityTypes: Array<{
      id: number;
    }> = await queryInterface.sequelize.query("SELECT id FROM activity_types", {
      type: QueryTypes.SELECT,
    });

    const activities = [];

    // Create some random activities
    // eslint-disable-next-line no-restricted-syntax
    for (const pet of pets) {
      // Create 3 activities for each pet
      for (let i = 0; i < 3; i += 1) {
        activities.push({
          user_id: userIds.length ? faker.helpers.arrayElement(userIds) : null,
          pet_id: pet.id,
          activity_type_id: activityTypes.length
            ? faker.helpers.arrayElement(activityTypes).id
            : 1,
          scheduled_start_time: faker.date.recent(),
          start_time: faker.date.recent(),
          end_time: faker.date.recent(),
          notes: faker.lorem.sentence(),
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }

    return queryInterface.bulkInsert("activities", activities, {});
  },

  down: async (queryInterface: QueryInterface): Promise<unknown> => {
    return queryInterface.bulkDelete("activities", {}, {});
  },
};
