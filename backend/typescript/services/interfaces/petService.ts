import { PetStatus, Sex } from "../../types";

export interface PetRequestDTO {
    animalTypeId: number;
    name: string;
    status: PetStatus;
    breed: string;
    age: number;
    adoptionStatus: boolean;
    weight: number;
    neutered: boolean;
    sex: Sex;
    photo: string;
    careInfo: {
        safetyInfo: string;
        medicalInfo: string;
        managementInfo: string; 
    } 
  }
  
  export interface PetResponseDTO {
    id: number;
    animalTypeId: number;
    name: string;
    status: PetStatus;
    breed: string;
    age: number;
    adoptionStatus: boolean;
    weight: number;
    neutered: boolean;
    sex: Sex;
    photo: string;
    careInfo: {  
        id: number; 
        safetyInfo: string;
        medicalInfo: string;
        managementInfo: string;
    } 
  }
  
  export interface IPetService {
    /**
     * retrieve the Pet with the given id
     * @param id Pet id
     * @returns requested Pet
     * @throws Error if retrieval fails
     */
    getPet(id: string): Promise<PetResponseDTO>;
  
    /**
     * retrieve all Pets
     * @param
     * @returns returns array of Pets
     * @throws Error if retrieval fails
     */
    getPets(): Promise<PetResponseDTO[]>;
  
    /**
     * create a Pet with the fields given in the DTO, return created Pet
     * @param pet new Pet
     * @returns the created Pet
     * @throws Error if creation fails
     */
    createPet(
      pet: PetRequestDTO,
    ): Promise<PetResponseDTO>;
  
    /**
     * update the Pet with the given id with fields in the DTO, return updated Pet
     * @param id Pet id
     * @param pet Updated Pet
     * @returns the updated Pet
     * @throws Error if update fails
     */
    updatePet(
      id: string,
      pet: PetRequestDTO,
    ): Promise<PetResponseDTO | null>;
  
    /**
     * delete the Pet with the given id
     * @param id Pet id
     * @returns id of the Pet deleted
     * @throws Error if deletion fails
     */
    deletePet(id: string): Promise<string>;

    /**
     * retrieve all Pets that match given filter criteria
     * @param
     * @returns returns array of Pets
     * @throws Error if retrieval fails
     */
    filterPets(query: any): Promise<PetResponseDTO[]>;

  }
  