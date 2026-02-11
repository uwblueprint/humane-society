/* eslint-disable */
import type { QueryInterface } from "sequelize";
import { resolveTable, tsKeys, withTS, Rec } from "../utilities/_utils";

const PET_FIXTURES: Rec[] = require("./mockData/pets.json")

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const Pets = await resolveTable(queryInterface, ["Pets", "pets"]);
    const pTS = await tsKeys(queryInterface, Pets);

    const pets: Rec[] = PET_FIXTURES.map((r) => withTS(r, pTS.createdKey, pTS.updatedKey));
    await queryInterface.bulkInsert(Pets, pets);
  },

  down: async (queryInterface: QueryInterface) => {
    const Pets = await resolveTable(queryInterface, ["Pets", "pets"]);
    await queryInterface.bulkDelete(Pets, {}, {});
  },
};
