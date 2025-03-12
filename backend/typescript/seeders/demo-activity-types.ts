import { QueryInterface } from 'sequelize';

// seed activity types
export = {
  up: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert('activity_types', [
      { 
        id: 1, 
        activity_name: 'Walk', 
        category: 'Walk',
        instruction: 'Go for a 15-20 minute walk on leash.'
      },
      { 
        id: 2, 
        activity_name: 'Feed', 
        category: 'Husbandry',
        instruction: 'Follow feeding chart.'
      },
      { 
        id: 3, 
        activity_name: 'Play', 
        category: 'Games',
        instruction: 'Have fun.'
      },
      { 
        id: 4, 
        activity_name: 'Groom', 
        category: 'Husbandry',
        instruction: 'Brush fur.'
      },
      { 
        id: 5, 
        activity_name: 'Medication', 
        category: 'Husbandry',
        instruction: 'Follow prescription instructions.'
      }
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete('activity_types', {});
  }
}; 