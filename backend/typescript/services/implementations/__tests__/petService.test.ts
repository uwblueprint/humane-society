// NOTE ON DB WIRING:
// petService.updatePet runs its writes inside a transaction created from the
// Sequelize instance exported by ../../models (which points at the DEV
// database), while the test suite drives schema + seed data through `testSql`
// (the TEST database) that owns the model classes. To keep the transaction and
// the model queries on the SAME connection/database, we redirect the
// ../../models `sequelize` export to `testSql`. The requireActual ordering below
// ensures the model classes are (re)bound to `testSql` last.
jest.mock("../../../models", () => {
  const real = jest.requireActual("../../../models");
  const { testSql } = jest.requireActual("../../../testUtils/testDb");
  return { __esModule: true, ...real, sequelize: testSql };
});

import PgPet from "../../../models/pet.model";
import { NotFoundError } from "../../../utilities/errorUtils";
import { AnimalTag, PetStatus } from "../../../types";
import { IPetService } from "../../interfaces/petService";
import PetService from "../petService";

import { testSql } from "../../../testUtils/testDb";

const createPet = () =>
  PgPet.create({
    animal_tag: AnimalTag.DOG,
    name: "Rex",
    status: PetStatus.NEEDS_CARE,
    color_level: 1,
  });

describe("pg petService.updatePet", () => {
  // Typed as the interface so we may pass a Partial<PetRequestDTO> (e.g. a
  // care-info-only body) without tripping the concrete class signature.
  let petService: IPetService;

  beforeEach(async () => {
    await testSql.sync({ force: true });
    petService = new PetService();
  });

  afterAll(async () => {
    await testSql.sync({ force: true });
    await testSql.close();
  });

  it("care-info-only update on an existing pet resolves and updates careInfo", async () => {
    const pet = await createPet();

    const result = await petService.updatePet(String(pet.id), {
      careInfo: { safetyInfo: "Bites when startled" },
    });

    expect(result.id).toEqual(pet.id);
    expect(result.name).toEqual("Rex");
    expect(result.careInfo?.safetyInfo).toEqual("Bites when startled");
  });

  it("pets-table field update (name + colorLevel) still works", async () => {
    const pet = await createPet();

    const result = await petService.updatePet(String(pet.id), {
      name: "Rexington",
      colorLevel: 3,
    });

    expect(result.id).toEqual(pet.id);
    expect(result.name).toEqual("Rexington");
    expect(result.colorLevel).toEqual(3);
  });

  it("throws NotFoundError when updating a non-existent pet", async () => {
    await expect(
      petService.updatePet("999999", { name: "Nobody" }),
    ).rejects.toThrow(NotFoundError);
  });
});
