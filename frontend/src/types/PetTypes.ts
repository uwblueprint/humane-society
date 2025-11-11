import { AnimalTag } from "./TaskTypes";

export enum SexEnum {
  MALE = "M",
  FEMALE = "F",
}

export enum TaskStatus {
  OCCUPIED = "Occupied",
  NEEDS_CARE = "Needs Care",
  DOES_NOT_NEED_CARE = "Does Not Need Care",
}

export interface Pet {
  id: number;
  name: string;
  animalTag: AnimalTag;
  colorLevel: number;
  status: TaskStatus;
  breed?: string;
  neutered?: boolean;
  birthday?: string;
  weight?: number;
  sex: SexEnum;
  photo?: string;
  careInfo?: {
    id: number;
    safetyInfo?: string;
    medicalInfo?: string;
    managementInfo?: string;
  };
}
