import { UserRoles } from "../constants/UserConstants";
import { AnimalTag } from "./TaskTypes";

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  role: UserRoles;
  status: string;
  colorLevel: number;
  animalTags: AnimalTag[];
  canSeeAllLogs?: boolean | null;
  canAssignUsersToTasks?: boolean | null;
  phoneNumber?: string | null;
  profilePhoto?: string;
};

export type CreateUserDTO = Omit<
  User,
  "id" | "status" | "animalTags" | "profilePhoto"
>;
