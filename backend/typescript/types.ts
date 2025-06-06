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
  colorLevel: number;
  animalTags: [AnimalTagEnum];
  canSeeAllLogs?: boolean | null;
  canAssignUsersToTasks?: boolean | null;
  phoneNumber?: string | null;
  profilePhoto?: string | null;
};

export type CreateUserDTO = Omit<
  UserDTO,
  "id" | "status" | "colorLevel" | "animalTags" | "profilePhoto"
>;

export type UpdateUserDTO = Omit<UserDTO, "id">;

export type RegisterUserDTO = Omit<CreateUserDTO, "role">;

export type AuthDTO = Token & UserDTO;

export type ResponseSuccessDTO = {
  success: boolean;
  errorMessage?: string;
};

export type Letters = "A" | "B" | "C" | "D";

const sexValues = ["M", "F"] as const;

export const sexEnum: Sex[] = [...sexValues];

export type Sex = typeof sexValues[number];

const petStatusValues = [
  "Assigned", // Assigned to me
  "Active", // Occupied
  "Needs Care",
  "Does Not Need Care",
] as const;

export const petStatusEnum: PetStatus[] = [...petStatusValues];

export type PetStatus = typeof petStatusValues[number];

export enum AnimalTagEnum {
  BIRD = "Bird",
  BUNNY = "Bunny",
  CAT = "Cat",
  DOG = "Dog",
  SMALL = "Small Animal",
}

// Skill level is in descending order, where Blue is the most skilled level of a volunteer
export enum ColorLevel {
  BLUE = "Blue", // 5
  RED = "Red", // 4
  ORANGE = "Orange", // 3
  YELLOW = "Yellow", // 2
  GREEN = "Green", // 1
}

export enum UserStatus {
  ACTIVE = "Active",
  INVITED = "Invited",
  INACTIVE = "Inactive",
}

export enum InteractionTypeEnum {
  // Task Status
  TASK_ASSIGNED = "Task Assigned",
  TASK_SELF_ASSIGNED = "Task Self-Assigned",
  TASK_UNASSIGNED = "Task Unassigned",
  TASK_STARTED = "Task Started",
  TASK_RESTARTED = "Task Restarted",
  TASK_COMPLETED = "Task Completed",
  TASK_INCOMPLETE = "Task Incomplete",
  TASK_INACTIVE = "Task Inactive",

  // Task Details
  TASK_DELETED = "Task Deleted",
  TASK_ASSIGNEE_CHANGED = "Task Assignee Changed",
  TASK_INSTRUCTIONS_CHANGED = "Task Instructions Changed",
  TASK_START_DATE_CHANGED = "Task Start Date Changed",
  TASK_END_DATE_CHANGED = "Task End Date Changed",
  RECURRING_TASK_DELETED = "Recurring Task Deleted",
  RECURRING_TASK_NAME_CHANGED = "Recurring Task Name Changed",
  RECURRING_TASK_DAYS_CHANGED = "Recurring Task Days Changed",
  RECURRING_TASK_CADENCE_CHANGED = "Recurring Task Cadence Changed",

  // Personal Details
  USER_NAME_CHANGED = "User Name Changed",
  USER_COLOR_LEVEL_CHANGED = "User Color Level Changed",
  USER_ROLE_CHANGED = "User Role Changed",

  // User Details
  USER_INVITED = "User Invited",
  USER_DELETED = "User Deleted",

  // Pet Details
  PET_DELETED = "Pet Deleted",
  PET_NAME_CHANGED = "Pet Name Changed",
  PET_COLOR_LEVEL_CHANGED = "Pet Color Level Changed",
  PET_NEUTER_STATUS_CHANGED = "Pet Neuter Status Changed",
  PET_SAFETY_INFO_CHANGED = "Pet Safety Info Changed",
  PET_MEDICAL_INFO_CHANGED = "Pet Medical Info Changed",
  PET_MANAGEMENT_INFO_CHANGED = "Pet Management Info Changed",

  // Task Template Details
  TASK_TEMPLATE_DELETED = "Task Template Deleted",
  TASK_TEMPLATE_NAME_CHANGED = "Task Template Name Changed",
  TASK_TEMPLATE_INSTRUCTIONS_CHANGED = "Task Template Instructions Changed",
}

export enum Category {
  GAMES = "Games",
  HUSBANDRY = "Husbandry",
  PEN_TIME = "Pen Time",
  TRAINING = "Training",
  WALK = "Walk",
  MISC = "Misc.",
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
