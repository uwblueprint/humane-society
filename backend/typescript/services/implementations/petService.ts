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
      animalTypeId: pet.animal_type_id,
      name: pet.name,
      status: pet.status,
      breed: pet.breed,
      age: pet.age,
      adoptionStatus: pet.adoption_status,
      weight: pet.weight,
      neutered: pet.neutered,
      sex: pet.sex,
      photo: pet.photo,
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
      animalTypeId: pet.animal_type_id,
      name: pet.name,
      status: pet.status,
      breed: pet.breed,
      age: pet.age,
      adoptionStatus: pet.adoption_status,
      weight: pet.weight,
      neutered: pet.neutered,
      sex: pet.sex,
      photo: pet.photo,
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
          animal_type_id: pet.animalTypeId,
          name: pet.name,
          status: pet.status,
          breed: pet.breed,
          age: pet.age,
          adoption_status: pet.adoptionStatus,
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
      id: newPet?.id,
      animalTypeId: newPet?.animal_type_id,
      name: newPet?.name,
      status: newPet?.status,
      breed: newPet?.breed,
      age: newPet?.age,
      adoptionStatus: newPet?.adoption_status,
      weight: newPet?.weight,
      neutered: newPet?.neutered,
      sex: newPet?.sex,
      photo: newPet?.photo,
      careInfo: {
        id: newPetCareInfo?.id,
        safetyInfo: newPetCareInfo?.safety_info ?? null,
        medicalInfo: newPetCareInfo?.medical_info ?? null,
        managementInfo: newPetCareInfo?.management_info ?? null,
      },
    };
  }

  async filterPets(query: PetQuery): Promise<PetResponseDTO[]> {
    try {
      const {
        animalTypeId,
        name,
        status,
        breed,
        age,
        adoptionStatus,
        weight,
        neutered,
        sex,
      } = query;
      const filters: WhereOptions = {};

      if (animalTypeId) filters.animal_type_id = Number(animalTypeId);
      if (name) filters.name = { [Op.iLike]: `%${name}%` }; // case-insensitive partial match
      if (status) filters.status = String(status);
      if (breed) filters.breed = { [Op.iLike]: `%${breed}%` }; // case-insensitive partial match
      if (age) filters.age = Number(age);
      if (adoptionStatus) filters.adoption_status = adoptionStatus === "true";
      if (weight) filters.weight = Number(weight);
      if (neutered) filters.neutered = neutered === "true";
      if (sex) filters.sex = String(sex);

      const pets: Array<PgPet> = await PgPet.findAll({
        where: filters,
      });
      const petResponseDTOs: PetResponseDTO[] = await Promise.all(
        pets.map(async (pet) => {
          return {
            id: pet.id,
            animalTypeId: pet.animal_type_id,
            name: pet.name,
            status: pet.status,
            breed: pet.breed,
            age: pet.age,
            adoptionStatus: pet.adoption_status,
            weight: pet.weight,
            neutered: pet.neutered,
            sex: pet.sex,
            photo: pet.photo,
            careInfo: {
              id: pet?.petCareInfo?.id ?? null,
              safetyInfo: pet?.petCareInfo?.safety_info ?? null,
              medicalInfo: pet?.petCareInfo?.medical_info ?? null,
              managementInfo: pet?.petCareInfo?.management_info ?? null,
            },
          };
        }),
      );

      return petResponseDTOs;
    } catch (error: unknown) {
      Logger.error(`Failed to get pets. Reason = ${getErrorMessage(error)}`);
      throw error;
    }
  }

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
          animal_type_id: pet.animalTypeId,
          name: pet.name,
          status: pet.status,
          breed: pet.breed,
          age: pet.age,
          adoption_status: pet.adoptionStatus,
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
      animalTypeId: resultingPet.animal_type_id,
      name: resultingPet.name,
      status: resultingPet.status,
      breed: resultingPet.breed,
      age: resultingPet.age,
      adoptionStatus: resultingPet.adoption_status,
      weight: resultingPet.weight,
      neutered: resultingPet.neutered,
      sex: resultingPet.sex,
      photo: resultingPet.photo,
      careInfo: {
        id: resultingPetCareInfo.id,
        safetyInfo: resultingPetCareInfo.safety_info ?? null,
        medicalInfo: resultingPetCareInfo.medical_info ?? null,
        managementInfo: resultingPetCareInfo.management_info ?? null,
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
