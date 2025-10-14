export enum SexEnum {
  MALE = "M",
  FEMALE = "F",
}

export type CareInfo = {
  safety?: string;
  management?: string;
  medical?: string;
};

export interface Pet {
  id: number;
  name: string;
  animalTag: string;
  colorLevel: number;
  status: string;
  breed?: string;
  neutered?: boolean;
  age?: number;
  weight?: number;
  sex?: string;
  photo?: string;
  careInfo?: {
    id: number;
    safetyInfo?: string;
    medicalInfo?: string;
    managementInfo?: string;
  };
}
