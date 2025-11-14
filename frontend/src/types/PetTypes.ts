import { AnimalTag, ColorLevel, TaskCategory, TaskStatus } from "./TaskTypes";

export enum SexEnum {
  MALE = "M",
  FEMALE = "F",
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
