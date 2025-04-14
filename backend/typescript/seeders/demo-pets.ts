import { QueryInterface, QueryTypes, Op } from "sequelize";
import { faker } from "@faker-js/faker";

export = {
  up: async (queryInterface: QueryInterface): Promise<unknown> => {
    // query animal types
    const animalTypes: Array<{
      id: number;
      animal_type_name: string;
    }> = await queryInterface.sequelize.query(
      "SELECT id, animal_type_name FROM animal_types",
      { type: QueryTypes.SELECT },
    );

    const statuses = ["Assigned", "Active", "Needs Care", "Does Not Need Care"];
    const pets = [];

    // make 5 pets for each animal type with faker
    for (const animalType of animalTypes) {
      for (let i = 1; i <= 5; i += 1) {
        pets.push({
          animal_type_id: animalType.id,
          name: `${animalType.animal_type_name} Seeded ${i}`,
          status: faker.helpers.arrayElement(statuses),
          breed: `${faker.word.adjective()} ${animalType.animal_type_name}`,
          age: faker.datatype.number({ min: 1, max: 15 }),
          adoption_status: faker.datatype.boolean(),
          weight: faker.datatype.number({ min: 5, max: 100, precision: 0.1 }),
          neutered: faker.datatype.boolean(),
          sex: faker.helpers.arrayElement(["M", "F"]),
          photo: faker.image.animals(640, 480, true),
          skill_level: faker.datatype.number({ min: 1, max: 5 }),
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }

    return queryInterface.bulkInsert("pets", pets, {});
  },

  down: async (queryInterface: QueryInterface): Promise<unknown> => {
    return queryInterface.bulkDelete(
      "pets",
      {
        name: { [Op.like]: "%Seeded%" },
      },
      {},
    );
  },
};
