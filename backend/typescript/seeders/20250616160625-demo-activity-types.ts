import { QueryInterface } from "sequelize";

export = {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.bulkInsert("activity_types", [
      {
        activity_name: "Dog Walking",
        category: "Walk",
        instruction:
          "Take the dog for a 15-30 minute walk around the facility grounds.",
      },
      {
        activity_name: "Cat Playtime",
        category: "Games",
        instruction: "Engage the cat with interactive toys for 20 minutes.",
      },
      {
        activity_name: "Basic Training",
        category: "Training",
        instruction: "Practice basic commands like sit, stay, and come.",
      },
      {
        activity_name: "Kennel Cleaning",
        category: "Husbandry",
        instruction: "Clean and sanitize the kennel area, replace bedding.",
      },
      {
        activity_name: "Feeding Time",
        category: "Husbandry",
        instruction:
          "Provide fresh food and water according to feeding schedule.",
      },
      {
        activity_name: "Bird Socialization",
        category: "Pen Time",
        instruction: "Spend quiet time with birds to help with socialization.",
      },
      {
        activity_name: "Bunny Exercise",
        category: "Games",
        instruction: "Allow bunny supervised exercise time in play area.",
      },
      {
        activity_name: "Small Animal Care",
        category: "Husbandry",
        instruction:
          "Clean habitat and provide fresh bedding for small animals.",
      },
      {
        activity_name: "General Assessment",
        category: "Misc.",
        instruction: "Observe and document animal behavior and wellbeing.",
      },
    ]);
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.bulkDelete("activity_types", {}, {});
  },
};
