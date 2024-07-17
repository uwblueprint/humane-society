import { DateOnlyDataType } from "sequelize";
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
  // petCareInfo: {
  //   safetyInfo: string;
  //   medicalInfo: string;
  //   managementInfo: string;
  // };
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
  // petCareInfo: {
  //   safetyInfo: string;
  //   medicalInfo: string;
  //   managementInfo: string;
  // };
}

export interface IPetService {
  /**
   * retrieve the Pet with the given id
   * @param id pet id
   * @returns requested pet
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
}
