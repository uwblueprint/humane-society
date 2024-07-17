import PgPet from "../../models/pet.model";
import PgPetCareInfo from "../../models/petCareInfo.model";
import {
  IPetService,
  PetRequestDTO,
  PetResponseDTO,
} from "../interfaces/petService";
import { Op, Transaction } from 'sequelize';
import { getErrorMessage, NotFoundError } from "../../utilities/errorUtils";
import logger from "../../utilities/logger";
import { sequelize } from "../../models";

const Logger = logger(__filename);

class PetService implements IPetService {
    async filterPets(query: any): Promise<PetResponseDTO[]> {
        try {
            const { animalTypeId, name, status, breed, age, adoptionStatus, weight, neutered, sex } = query;
            const filters: any = {};

            if (animalTypeId) filters.animal_type_id = Number(animalTypeId);
            if (name) filters.name = { [Op.iLike]: `%${name}%` }; // case-insensitive partial match
            if (status) filters.status = String(status);
            if (breed) filters.breed = { [Op.iLike]: `%${breed}%` }; // case-insensitive partial match
            if (age) filters.age = Number(age);
            if (adoptionStatus) filters.adoption_status = adoptionStatus === 'true';
            if (weight) filters.weight = Number(weight);
            if (neutered) filters.neutered = neutered === 'true';
            if (sex) filters.sex = String(sex);

            const pets: Array<PgPet> = await PgPet.findAll({
                where: filters,
            });
            const petResponseDTOs: PetResponseDTO[] = await Promise.all(pets.map(async (pet) => {          
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
                        id: pet.PetCareInfo.id,
                        safetyInfo: pet.PetCareInfo.safety_info,
                        medicalInfo: pet.PetCareInfo.medical_info,
                        managementInfo: pet.PetCareInfo.management_info,
                    }
                };
            }));
            return petResponseDTOs;

          } catch (error: unknown) {
            Logger.error(
              `Failed to get pets. Reason = ${getErrorMessage(error)}`,
            );
            throw error;
          }
    }
    /* eslint-disable class-methods-use-this */
    async getPet(id: string): Promise<PetResponseDTO> {
        throw new Error("Method not implemented.");
    }
    async getPets(): Promise<PetResponseDTO[]> {
        throw new Error("Method not implemented.");
    }
    async createPet(pet: PetRequestDTO): Promise<PetResponseDTO> {
        throw new Error("Method not implemented.");
    }
    async updatePet(id: string, pet: PetRequestDTO): Promise<PetResponseDTO | null> {
        let resultingPet: PgPet | null;
        let resultingPetCareInfo: PgPetCareInfo | null;
        let petUpdateResult: [number, PgPet[]] | null;
        let petCareInfoUpdateResult: [number, PgPetCareInfo[]] | null

        let transaction: Transaction = await sequelize.transaction(); 

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
                    //MAYBE CAN SIMPLIFY THIS WITH THE HASONE THING?
                },
                { where: { id }, returning: true, transaction },
            );
            if (!petUpdateResult![0]) {
                throw new NotFoundError(`Pet id ${id} not found`);
            }
            [, [resultingPet]] = petUpdateResult!;

            petCareInfoUpdateResult = await PgPetCareInfo.update(
                {
                    safety_info: pet.careInfo.safetyInfo,
                    medical_info: pet.careInfo.medicalInfo,
                    management_info: pet.careInfo.managementInfo,
                },
                { where: { pet_id: id }, returning: true, transaction },
            ); 
            if (!petCareInfoUpdateResult![0]) {
                throw new NotFoundError(`Pet care info with pet id ${id} not found`); 
            }
            [, [resultingPetCareInfo]] = petCareInfoUpdateResult!;
            await transaction.commit();

        } catch (error: unknown) { 
            await transaction.rollback(); 

            Logger.error(
                `Failed to update pet. Reason = ${getErrorMessage(error)}`,
            );
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
                safetyInfo: resultingPetCareInfo.safety_info,
                medicalInfo: resultingPetCareInfo.medical_info,
                managementInfo: resultingPetCareInfo.management_info, 
            }
        };
    }
    async deletePet(id: string): Promise<string> {
        let transaction: Transaction = await sequelize.transaction(); 
        try {
            const deletePetResult: number | null = await PgPet.destroy({
              where: { id },
              transaction,
            }); 

            if (!deletePetResult) {
                throw new NotFoundError(`Pet with id ${id} not found`);
            }

            const deleteCareInfoResult: number | null = await PgPetCareInfo.destroy({
                where: { pet_id: id, transaction },
            });  
            if (!deleteCareInfoResult) {
                throw new NotFoundError(`Pet care info with pet id ${id} not found`);
            }
            transaction.commit();
            return id;
        } catch (error: unknown) {
            transaction.rollback()
            Logger.error(
                `Failed to delete pet. Reason = ${getErrorMessage(error)}`,
            );
            throw error;
        } 
    } 
}

//Should you name it PgPetCareInfo or PgCareInfo
//If there's inconsistency-- error?
export default PetService;
