import { PetStatus, Sex, AnimalTag } from "../../types";

export interface PetRequestDTO {
  animalTag: AnimalTag;
  name: string;
  colorLevel: number;
  status: PetStatus | null;
  breed: string | null;
  birthday: Date | null;
  weight: number | null;
  neutered: boolean | null;
  sex: Sex | null;
  photo: string | null;
  careInfo: {
    safetyInfo: string | null;
    medicalInfo: string | null;
    managementInfo: string | null;
  };
}

export interface PetResponseDTO {
  id: number;
  name: string;
  animalTag: AnimalTag;
  colorLevel: number;
  status: PetStatus | null;
  breed: string | null;
  age: number | null;
  weight: number | null;
  neutered: boolean | null;
  sex: Sex | null;
  photo: string | null;
  careInfo: {
    id: number;
    safetyInfo: string | null;
    medicalInfo: string | null;
    managementInfo: string | null;
  };
}

export interface PetQuery {
  animalTag?: string;
  name?: string;
  colorLevel?: string;
  status?: string;
  breed?: string;
  age?: string;
  weight?: string;
  neutered?: string;
  sex?: string;
}

export interface IPetService {
  /**
   * Gets the pet's age from their birthday
   * @param birthday birthday of pet
   */
  getAgeFromBirthday(birthday: Date): number;
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
  createPet(pet: PetRequestDTO): Promise<PetResponseDTO>;

  /**
   * update the Pet with the given id with fields in the DTO, return updated Pet
   * @param id Pet id
   * @param pet Updated Pet
   * @returns the updated Pet
   * @throws Error if update fails
   */
  updatePet(id: string, pet: PetRequestDTO): Promise<PetResponseDTO | null>;

  /**
   * delete the Pet with the given id
   * @param id Pet id
   * @returns id of the Pet deleted
   * @throws Error if deletion fails
   */
  deletePet(id: string): Promise<string>;

  /**
   * retrieve all Pets that match given filter criteria
   * @param query Pet queries
   * @returns returns array of Pets
   * @throws Error if retrieval fails
   */
  // filterPets(query: PetQuery): Promise<PetResponseDTO[]>;
}
