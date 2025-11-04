import {
  PetStatus,
  Sex,
  AnimalTag,
  ColorLevel,
  TaskCategory,
} from "../../types";

export interface PetRequestDTO {
  animalTag: AnimalTag;
  name: string;
  colorLevel: number;
  status: PetStatus;
  breed?: string;
  neutered?: boolean;
  birthday?: string;
  weight?: number;
  sex?: Sex;
  photo?: string;
  careInfo?: {
    safetyInfo?: string;
    medicalInfo?: string;
    managementInfo?: string;
  };
}

export interface PetResponseDTO {
  id: number;
  name: string;
  animalTag: AnimalTag;
  colorLevel: number;
  status: PetStatus;
  breed?: string;
  neutered?: boolean;
  age?: number;
  weight?: number;
  sex?: Sex;
  photo?: string;
  careInfo?: {
    id: number;
    safetyInfo?: string;
    medicalInfo?: string;
    managementInfo?: string;
  };
}

export interface PetListItemDTO {
  id: number;
  name: string;
  color: ColorLevel;
  taskCategories: TaskCategory[];
  status: PetStatus;
  lastCaredFor: string | null; // will hold a time, 'One or more days ago' or null
  allTasksAssigned: boolean | null; // null if there are no tasks
  isAssignedToMe: boolean;
  photo?: string;
}

// Dictionary that maps section names to arrays of pets
export type PetListSections = Record<string, PetListItemDTO[]>;

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

// result of a join between pet and task table
export interface PetTask {
  pet_id: number;
  name: string;
  status: PetStatus;
  photo?: string;
  color_level: number;
  animal_tag?: AnimalTag;
  user_id?: number;
  task_template_id?: number;
  scheduled_start_time?: Date;
  start_time?: Date;
  end_time?: Date;
}

export interface IPetService {
  /**
   * Gets the pet's age from their birthday
   * @param birthday birthday of pet
   */
  getAgeFromBirthday(birthday: string): number;
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
  updatePet(id: string, pet: PetRequestDTO): Promise<PetResponseDTO>;

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

  /**
   * get pets for pet list
   * @param userId
   * @returns dictionary of section name to PetList arrays
   * @throws Error if retrieval fails
   */
  getPetList(userId: number): Promise<PetListSections>;
}
