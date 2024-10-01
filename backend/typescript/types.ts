export enum Role {
  ADMINISTRATOR = "Administrator",
  ANIMAL_BEHAVIOURIST = "Animal Behaviourist",
  STAFF = "Staff",
  VOLUNTEER = "Volunteer",
}

export type Token = {
  accessToken: string;
  refreshToken: string;
};

export type UserDTO = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  status: UserStatus;
  skillLevel?: number | null;
  canSeeAllLogs?: boolean | null;
  canAssignUsersToTasks?: boolean | null;
  phoneNumber?: string | null;
};

export type CreateUserDTO = Omit<UserDTO, "id"> & { password: string };

export type UpdateUserDTO = Omit<UserDTO, "id">;

export type RegisterUserDTO = Omit<CreateUserDTO, "role">;

export type AuthDTO = Token & UserDTO;

export type Letters = "A" | "B" | "C" | "D";

const sexValues = ["M", "F"] as const;

export const sexEnum: Sex[] = [...sexValues];

export type Sex = typeof sexValues[number];

const petStatusValues = [
  "Assigned",
  "Active",
  "Needs Care",
  "Does Not Need Care",
] as const;

export const petStatusEnum: PetStatus[] = [...petStatusValues];

export type PetStatus = typeof petStatusValues[number];

export enum UserStatus {
  ACTIVE = "Active",
  INVITED = "Invited",
  INACTIVE = "Inactive",
}

export type NodemailerConfig = {
  service: "gmail";
  auth: {
    type: "OAuth2";
    user: string;
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  };
};

export type SignUpMethod = "PASSWORD" | "GOOGLE";
