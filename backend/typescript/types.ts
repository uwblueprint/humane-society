export type Role =
  | "Administrator"
  | "Animal Behaviourist"
  | "Staff"
  | "Volunteer";

export enum RoleId {
  Administrator = 1,
  AnimalBehaviourist = 2,
  Staff = 3,
  Volunteer = 4,
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
  roleId: number;
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

export type Sex = "M" | "F";

export type PetStatus =
  | "Assigned"
  | "Active"
  | "Needs Care"
  | "Does Not Need Care";

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

export type DTOTypes = Record<string, string | RoleId>;
