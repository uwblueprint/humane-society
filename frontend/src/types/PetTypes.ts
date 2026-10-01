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

export const ASSIGNED_TO_YOU_FILTER_VALUE = "Assigned to You" as const;

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
  sex?: SexEnum | null;
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
  | "Unassigned Tasks"
  | "Assigned Tasks"
  | "No Tasks";

// For role-based view
export type PetListRecord = Partial<
  Record<PetListSectionKey, PetListItemDTO[]>
>;

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

export interface PetRequestDTO {
  animalTag: AnimalTag;
  name: string;
  colorLevel: number;
  breed?: string | null;
  neutered?: boolean | null;
  birthday?: string | null;
  weight?: number | null;
  sex?: SexEnum | null;
  photo?: string | null;
  careInfo?: {
    safetyInfo?: string | null;
    medicalInfo?: string | null;
    managementInfo?: string | null;
  } | null;
}

export type PetListSections = Record<string, PetListItemDTO[]>;
