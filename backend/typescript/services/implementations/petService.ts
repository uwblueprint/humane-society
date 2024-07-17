import PgPet from "../../models/pet.model";
import {
  IPetService,
  PetRequestDTO,
  PetResponseDTO,
} from "../interfaces/petService";
import { getErrorMessage, NotFoundError } from "../../utilities/errorUtils";
import logger from "../../utilities/logger";

const Logger = logger(__filename);

class PetService implements IPetService {
  /* eslint-disable class-methods-use-this */
  async getPet(id: string): Promise<PetResponseDTO> {
    let pet: PgPet | null;
    try {
      pet = await PgPet.findByPk(id, { raw: true });
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
      // careInfo: {
      //     safety: pet.safety;
      //     medical: pet.medical;
      //     management: pet.management;
      //   };
    };
  }

  async getPets(): Promise<PetResponseDTO[]> {
    let pets: Array<PgPet>;
    try {
      pets = await PgPet.findAll({ raw: true });
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
      // careInfo: {
      //     safety: pet.safety;
      //     medical: pet.medical;
      //     management: pet.management;
      //   };
    }));
  }

  async createPet(pet: PetRequestDTO): Promise<PetResponseDTO> {
    let newPet: PgPet | null;
    try {
      newPet = await PgPet.create({
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
        // careInfo: {
        //     safety: pet.safety;
        //     medical: pet.medical;
        //     management: pet.management;
        //   };
      });
    } catch (error: unknown) {
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
      // careInfo: {
      //     safety: pet.safety;
      //     medical: pet.medical;
      //     management: pet.management;
      //   };
    };
  }
}

export default PetService;
