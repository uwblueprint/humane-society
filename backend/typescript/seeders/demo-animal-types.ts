import { QueryInterface } from 'sequelize';

// seed animal types
export = {
  up: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert('animal_types', [
      { animal_type_name: 'Dog', id: 1 },
      { animal_type_name: 'Cat', id: 2 },
      { animal_type_name: 'Bird', id: 3 },
      { animal_type_name: 'Rabbit', id: 4 }
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete('animal_types', {});
  }
}; 