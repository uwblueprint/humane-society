import { AnimalTag, ColorLevel, TaskCategory, TaskStatus } from "./TaskTypes";

export enum SexEnum {
  MALE = "M",
  FEMALE = "F",
}

export enum AnimalTaskStatus {
  OCCUPIED = "Occupied",
  NEEDS_CARE = "Needs Care",
  DOES_NOT_NEED_CARE = "Does Not Need Care",
}

export interface Pet {
  id: number;
  name: string;
  animalTag: AnimalTag;
  colorLevel: number;
  status: AnimalTaskStatus;
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
export type CareInfo = {
  safety?: string;
  management?: string;
  medical?: string;
};

export type PetListSectionKey =
  | "Assigned to You"
  | "Other Pets"
  | "Has Unassigned Tasks"
  | "All Tasks Assigned"
  | "No Tasks";

export interface PetInfo {
  id: number;
  name: string;
  color: ColorLevel;
  photo?: string;
  taskCategories: TaskCategory[];
  status: TaskStatus;
  lastCaredFor: string | null;
  allTasksAssigned: boolean;
  animalTag: AnimalTag;
}

export type PetListRecord = Partial<Record<PetListSectionKey, PetInfo[]>>;
