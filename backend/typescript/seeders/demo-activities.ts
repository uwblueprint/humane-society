import { QueryInterface, QueryTypes } from 'sequelize';
import { faker } from '@faker-js/faker';

export = {
  up: async (queryInterface: QueryInterface) => {
    // get seeded users
    const users: Array<{ id: number }> = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email LIKE \'%@seeded.com\'',
      { type: QueryTypes.SELECT }
    );

    // get seeded pets
    const pets: Array<{ id: number }> = await queryInterface.sequelize.query(
      'SELECT id FROM pets WHERE name LIKE \'%Seeded%\'',
      { type: QueryTypes.SELECT }
    );

    // get activity types
    const activityTypes: Array<{ id: number }> = await queryInterface.sequelize.query(
      'SELECT id FROM activity_types',
      { type: QueryTypes.SELECT }
    );

    const activities = [];

    // make some random activities
    for (const pet of pets) {
      // make 3 activities for each pet
      for (let i = 0; i < 3; i++) {
        activities.push({
          user_id: faker.helpers.arrayElement(users).id,
          pet_id: pet.id,
          activity_type_id: faker.helpers.arrayElement(activityTypes).id,
          scheduled_start_time: faker.date.future(),
          start_time: null,
          end_time: null,
          notes: faker.lorem.sentence(),
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    }

    return queryInterface.bulkInsert('activities', activities, {});
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete('activities', {});
  }
}; 