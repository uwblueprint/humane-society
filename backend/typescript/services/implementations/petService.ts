// ! CALCULATE AGE 


import { Op, Transaction, WhereOptions } from "sequelize";
import PgPet from "../../models/pet.model";
import PgPetCareInfo from "../../models/petCareInfo.model";
import {
  IPetService,
  PetQuery,
  PetRequestDTO,
  PetResponseDTO,
} from "../interfaces/petService";
import { getErrorMessage, NotFoundError } from "../../utilities/errorUtils";
import logger from "../../utilities/logger";
import { sequelize } from "../../models";

const Logger = logger(__filename);

class PetService implements IPetService {
  /* eslint-disable class-methods-use-this */
  getAgeFromBirthday(birthday: Date): number {
    const currentDate = new Date();
    const ageInMs = currentDate.valueOf() - birthday.valueOf();
    const msInYear = 1000 * 60 * 60 * 24 * 365.25;
    const age = Math.floor(ageInMs / msInYear);
    return age;
  }

  async getPet(id: string): Promise<PetResponseDTO> {
    let pet: PgPet | null;
    try {
      pet = await PgPet.findByPk(id, { include: PgPetCareInfo, plain: true });
      if (!pet) {
        throw new NotFoundError(`Pet id ${id} not found`);
      }
    } catch (error: unknown) {
      Logger.error(`Failed to get pet. Reason = ${getErrorMessage(error)}`);
      throw error;
    }

    return {
      id: pet.id,
      animalTag: pet.animal_tag,
      name: pet.name,
      colorLevel: pet.color_level,
      status: pet.status,
      breed: pet.breed ?? null,
      age: pet.birthday ? this.getAgeFromBirthday(pet.birthday) : null,
      weight: pet.weight ?? null,
      neutered: pet.neutered ?? null,
      sex: pet.sex ?? null,
      photo: pet.photo ?? null,
      careInfo: {
        id: pet.petCareInfo?.id,
        safetyInfo: pet.petCareInfo?.safety_info ?? null,
        medicalInfo: pet.petCareInfo?.medical_info ?? null,
        managementInfo: pet.petCareInfo?.management_info ?? null,
      },
    };
  }

  async getPets(): Promise<PetResponseDTO[]> {
    let pets: Array<PgPet>;
    try {
      pets = await PgPet.findAll({
        include: [
          {
            model: PgPetCareInfo,
          },
        ],
      });
    } catch (error: unknown) {
      Logger.error(`Failed to get pets. Reason = ${getErrorMessage(error)}`);
      throw error;
    }

    return pets.map((pet) => ({
      id: pet.id,
      name: pet.name,
      animalTag: pet.animal_tag,
      colorLevel: pet.color_level,
      status: pet.status,
      breed: pet.breed ?? null,
      age: pet.birthday ? this.getAgeFromBirthday(pet.birthday) : null,
      weight: pet.weight ?? null,
      neutered: pet.neutered ?? null,
      sex: pet.sex ?? null,
      photo: pet.photo ?? null,
      careInfo: {
        id: pet.petCareInfo?.id,
        safetyInfo: pet.petCareInfo?.safety_info ?? null,
        medicalInfo: pet.petCareInfo?.medical_info ?? null,
        managementInfo: pet.petCareInfo?.management_info ?? null,
      },
    }));
  }

  async createPet(pet: PetRequestDTO): Promise<PetResponseDTO> {
    let newPet: PgPet | null;
    let newPetCareInfo: PgPetCareInfo | null;

    const transaction: Transaction = await sequelize.transaction();

    try {
      newPet = await PgPet.create(
        {
          animalTag: pet.animalTag,
          name: pet.name,
          status: pet.status,
          colorLevel: pet.colorLevel,
          breed: pet.breed,
          birthday: pet.birthday,
          weight: pet.weight,
          neutered: pet.neutered,
          sex: pet.sex,
          photo: pet.photo,
        },
        { transaction },
      );

      newPetCareInfo = await PgPetCareInfo.create(
        {
          pet_id: newPet?.id,
          safety_info: pet.careInfo.safetyInfo,
          medical_info: pet.careInfo.medicalInfo,
          management_info: pet.careInfo.managementInfo,
        },
        { transaction },
      );

      await transaction.commit();
    } catch (error: unknown) {
      await transaction.rollback();
      Logger.error(`Failed to create pet. Reason = ${getErrorMessage(error)}`);
      throw error;
    }

    return {
      id: newPet.id,
      name: newPet.name,
      animalTag: newPet.animal_tag,
      colorLevel: newPet.color_level,
      status: newPet.status,
      breed: newPet.breed ?? null,
      age: newPet.birthday ? this.getAgeFromBirthday(newPet.birthday) : null,
      weight: newPet.weight ?? null,
      neutered: newPet.neutered ?? null,
      sex: newPet.sex ?? null,
      photo: newPet.photo ?? null,
      careInfo: {
        id: newPetCareInfo?.id,
        safetyInfo: newPetCareInfo?.safety_info ?? null,
        medicalInfo: newPetCareInfo?.medical_info ?? null,
        managementInfo: newPetCareInfo?.management_info ?? null,
      },
    };
  }

  // FILTER IS NOW IMPLEMENTED IN FRONT END
  // async filterPets(query: PetQuery): Promise<PetResponseDTO[]> {
  //   try {
  //     const {
  //       animalTypeId,
  //       name,
  //       status,
  //       breed,
  //       age,
  //       adoptionStatus,
  //       weight,
  //       neutered,
  //       sex,
  //     } = query;
  //     const filters: WhereOptions = {};

  //     if (animalTypeId) filters.animal_type_id = Number(animalTypeId);
  //     if (name) filters.name = { [Op.iLike]: `%${name}%` }; // case-insensitive partial match
  //     if (status) filters.status = String(status);
  //     if (breed) filters.breed = { [Op.iLike]: `%${breed}%` }; // case-insensitive partial match
  //     if (age) filters.age = Number(age);
  //     if (adoptionStatus) filters.adoption_status = adoptionStatus === "true";
  //     if (weight) filters.weight = Number(weight);
  //     if (neutered) filters.neutered = neutered === "true";
  //     if (sex) filters.sex = String(sex);

  //     const pets: Array<PgPet> = await PgPet.findAll({
  //       where: filters,
  //     });
  //     const petResponseDTOs: PetResponseDTO[] = await Promise.all(
  //       pets.map(async (pet) => {
  //         return {
  //           id: pet.id,
  //           animalTypeId: pet.animal_type_id,
  //           name: pet.name,
  //           status: pet.status,
  //           breed: pet.breed,
  //           age: pet.age,
  //           adoptionStatus: pet.adoption_status,
  //           weight: pet.weight,
  //           neutered: pet.neutered,
  //           sex: pet.sex,
  //           photo: pet.photo,
  //           careInfo: {
  //             id: pet?.petCareInfo?.id ?? null,
  //             safetyInfo: pet?.petCareInfo?.safety_info ?? null,
  //             medicalInfo: pet?.petCareInfo?.medical_info ?? null,
  //             managementInfo: pet?.petCareInfo?.management_info ?? null,
  //           },
  //         };
  //       }),
  //     );

  //     return petResponseDTOs;
  //   } catch (error: unknown) {
  //     Logger.error(`Failed to get pets. Reason = ${getErrorMessage(error)}`);
  //     throw error;
  //   }
  // }

  // ! check this is updated for optional fields
  async updatePet(
    id: string,
    pet: PetRequestDTO,
  ): Promise<PetResponseDTO | null> {
    let resultingPet: PgPet | null;
    let resultingPetCareInfo: PgPetCareInfo | null;
    let petUpdateResult: [number, PgPet[]] | null;
    let petCareInfoUpdateResult: [number, PgPetCareInfo[]] | null;

    const transaction: Transaction = await sequelize.transaction();

    try {
      petUpdateResult = await PgPet.update(
        {
          animalTag: pet.animalTag,
          name: pet.name,
          colorLevel: pet.colorLevel,
          status: pet.status,
          breed: pet.breed,
          birthday: pet.birthday,
          weight: pet.weight,
          neutered: pet.neutered,
          sex: pet.sex,
          photo: pet.photo,
        },
        { where: { id }, returning: true, transaction },
      );
      if (!petUpdateResult[0]) {
        throw new NotFoundError(`Pet id ${id} not found`);
      }
      [, [resultingPet]] = petUpdateResult;

      petCareInfoUpdateResult = await PgPetCareInfo.update(
        {
          safety_info: pet.careInfo.safetyInfo,
          medical_info: pet.careInfo.medicalInfo,
          management_info: pet.careInfo.managementInfo,
        },
        { where: { pet_id: id }, returning: true, transaction },
      );
      if (!petCareInfoUpdateResult[0]) {
        throw new NotFoundError(`Pet care info with pet id ${id} not found`);
      }
      [, [resultingPetCareInfo]] = petCareInfoUpdateResult;
      await transaction.commit();
    } catch (error: unknown) {
      await transaction.rollback();

      Logger.error(`Failed to update pet. Reason = ${getErrorMessage(error)}`);
      throw error;
    }

    return {
      id: resultingPet.id,
      animalTag: resultingPet.animal_tag,
      name: resultingPet.name,
      colorLevel: resultingPet.color_level,
      status: resultingPet.status,
      breed: resultingPet.breed ?? null,
      age: resultingPet.birthday
        ? this.getAgeFromBirthday(resultingPet.birthday)
        : null,
      weight: resultingPet.weight ?? null,
      neutered: resultingPet.neutered ?? null,
      sex: resultingPet.sex ?? null,
      photo: resultingPet.photo ?? null,
      careInfo: {
        id: resultingPetCareInfo?.id,
        safetyInfo: resultingPetCareInfo?.safety_info ?? null,
        medicalInfo: resultingPetCareInfo?.medical_info ?? null,
        managementInfo: resultingPetCareInfo?.management_info ?? null,
      },
    };
  }

  async deletePet(id: string): Promise<string> {
    try {
      const deletePetResult: number | null = await PgPet.destroy({
        where: { id },
      });

      if (!deletePetResult) {
        throw new NotFoundError(`Pet with id ${id} not found`);
      }
    } catch (error: unknown) {
      Logger.error(`Failed to delete pet. Reason = ${getErrorMessage(error)}`);
      throw error;
    }
    return id;
  }
}

export default PetService;
