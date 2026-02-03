import { AnimalTag, ColorLevel, TaskCategory } from "./TaskTypes";

export enum SexEnum {
  MALE = "M",
  FEMALE = "F",
}

export enum PetStatus {
  OCCUPIED = "Occupied",
  NEEDS_CARE = "Needs Care",
  DOES_NOT_NEED_CARE = "Does Not Need Care",
}

export interface Pet {
  id: number;
  name: string;
  animalTag: AnimalTag;
  colorLevel: number;
  status: PetStatus;
  breed?: string;
  neutered?: boolean;
  age?: number;
  birthday?: string;
  weight?: number;
  sex?: SexEnum;
  photo?: string;
  careInfo?: {
    id: number;
    safetyInfo?: string;
    medicalInfo?: string;
    managementInfo?: string;
  };
}

export type CareInfo = {
  id: number;
  safetyInfo?: string;
  medicalInfo?: string;
  managementInfo?: string;
};

export type PetListSectionKey =
  | "Assigned to You"
  | "Other Pets"
  | "Has Unassigned Tasks"
  | "All Tasks Assigned"
  | "No Tasks";

// For frontend pet list display
export interface PetInfo {
  id: number;
  name: string;
  color: ColorLevel;
  photo?: string;
  taskCategories: TaskCategory[];
  status: PetStatus;
  lastCaredFor: string | null;
  allTasksAssigned: boolean | null;
  animalTag: AnimalTag;
}

// For role-based view
export type PetListRecord = Partial<Record<PetListSectionKey, PetInfo[]>>;

export interface PetListItemDTO {
  id: number;
  name: string;
  color: ColorLevel;
  taskCategories: TaskCategory[];
  status: PetStatus;
  lastCaredFor: string | null;
  allTasksAssigned: boolean | null;
  isAssignedToMe: boolean;
  photo?: string;
  animalTag: AnimalTag;
}

export type PetListSections = Record<string, PetListItemDTO[]>;
