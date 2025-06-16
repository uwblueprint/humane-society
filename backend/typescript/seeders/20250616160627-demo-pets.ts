import { QueryInterface } from "sequelize";
import { faker } from "@faker-js/faker";

interface PetSeedData {
  animal_tag: string;
  name: string;
  status: string;
  breed: string;
  birthday: string;
  weight: number;
  color_level: number;
  neutered: boolean;
  sex: string;
  photo: string;
  created_at: Date;
  updated_at: Date;
}

const animalTypes = ["Dog", "Cat", "Bird", "Bunny", "Small Animal"];
const petStatuses = ["Occupied", "Needs Care", "Does Not Need Care"];
const sexes = ["M", "F"];

const dogBreeds = [
  "Golden Retriever",
  "Labrador",
  "German Shepherd",
  "Bulldog",
  "Beagle",
];
const catBreeds = [
  "Persian",
  "Siamese",
  "Maine Coon",
  "British Shorthair",
  "Ragdoll",
];
const birdTypes = ["Cockatiel", "Budgie", "Canary", "Lovebird", "Conure"];
const bunnyBreeds = [
  "Holland Lop",
  "Mini Rex",
  "Lionhead",
  "Dutch",
  "Flemish Giant",
];
const smallAnimals = [
  "Guinea Pig",
  "Hamster",
  "Ferret",
  "Chinchilla",
  "Rabbit",
];

const getRandomBreed = (animalType: string): string => {
  switch (animalType) {
    case "Dog":
      return dogBreeds[Math.floor(Math.random() * dogBreeds.length)];
    case "Cat":
      return catBreeds[Math.floor(Math.random() * catBreeds.length)];
    case "Bird":
      return birdTypes[Math.floor(Math.random() * birdTypes.length)];
    case "Bunny":
      return bunnyBreeds[Math.floor(Math.random() * bunnyBreeds.length)];
    case "Small Animal":
      return smallAnimals[Math.floor(Math.random() * smallAnimals.length)];
    default:
      return "Mixed";
  }
};

const getWeightByAnimalType = (animalType: string): number => {
  if (animalType === "Small Animal") {
    return faker.number.float({ min: 0.5, max: 5, fractionDigits: 1 });
  }
  if (animalType === "Cat") {
    return faker.number.float({ min: 3, max: 15, fractionDigits: 1 });
  }
  if (animalType === "Bird") {
    return faker.number.float({ min: 0.1, max: 2, fractionDigits: 2 });
  }
  if (animalType === "Bunny") {
    return faker.number.float({ min: 1, max: 8, fractionDigits: 1 });
  }
  // Dog
  return faker.number.float({ min: 10, max: 80, fractionDigits: 1 });
};

export = {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const pets: PetSeedData[] = [];

    // Create 5 pets for each animal type
    animalTypes.forEach((animalType) => {
      Array.from({ length: 5 }, (_, i) => i).forEach(() => {
        pets.push({
          animal_tag: animalType,
          name: faker.person.firstName(),
          status: petStatuses[Math.floor(Math.random() * petStatuses.length)],
          breed: getRandomBreed(animalType),
          birthday: faker.date.past({ years: 10 }).toISOString().split("T")[0],
          weight: getWeightByAnimalType(animalType),
          color_level: Math.floor(Math.random() * 5) + 1,
          neutered: Math.random() > 0.5,
          sex: sexes[Math.floor(Math.random() * sexes.length)],
          photo: faker.image.url(),
          created_at: new Date(),
          updated_at: new Date(),
        });
      });
    });

    await queryInterface.bulkInsert("pets", pets);
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.bulkDelete("pets", {}, {});
  },
};
