import { UserRoles } from "../constants/UserConstants";

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  role: UserRoles;
  status: string;
  colorLevel: number;
  animalTags: ["Bird" | "Bunny" | "Cat" | "Dog" | "Small Animal"];
  canSeeAllLogs?: boolean | null;
  canAssignUsersToTasks?: boolean | null;
  phoneNumber?: string | null;
  profilePhoto?: string;
};

export type CreateUserDTO = Omit<
  User,
  "id" | "status" | "colorLevel" | "animalTags" | "profilePhoto"
>;
