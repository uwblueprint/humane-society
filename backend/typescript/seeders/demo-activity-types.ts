import { QueryInterface } from 'sequelize';

// seed activity types
export = {
  up: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert('activity_types', [
      { id: 1, activity_name: 'Walk' },
      { id: 2, activity_name: 'Feed' },
      { id: 3, activity_name: 'Play' },
      { id: 4, activity_name: 'Groom' },
      { id: 5, activity_name: 'Medication' }
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete('activity_types', {});
  }
}; 