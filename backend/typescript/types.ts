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

export type Sex = (typeof sexValues)[number];

const petStatusValues = [
  "Assigned", // Assigned to me
  "Active", // Occupied
  "Needs Care",
  "Does Not Need Care",
] as const;

export const petStatusEnum: PetStatus[] = [...petStatusValues];

export type PetStatus = (typeof petStatusValues)[number];

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
  ASSIGNED_TASK = "Assigned Task",
  SELF_ASSIGNED_TASK = "Self-Assigned Task",
  UNASSIGNED_TASK = "Unassigned Task",
  STARTED_TASK = "Started Task",
  RESTARTED_TASK = "Restarted Task",
  COMPLETED_TASK = "Completed Task",
  MARKED_TASK_INCOMPLETE = "Incomplete Task",
  MARKED_TASK_INACTIVE = "Inactive Task",

  // Task Details
  DELETED_TASK = "Deleted Task",
  CHANGED_TASK_ASSIGNEE = "Changed Task Assignee",
  CHANGED_TASK_INSTRUCTIONS = "Changed Task Instructions",
  CHANGED_TASK_START_DATE = "Changed Task Start Date",
  CHANGED_TASK_END_DATE = "Changed Task End Date",
  DELETED_RECURRING_TASK = "Deleted Recurring Task",
  CHANGED_RECURRING_TASK_NAME = "Changed Recurring Task Name",
  CHANGED_RECURRING_TASK_DAYS = "Changed Recurring Task Days",
  CHANGED_RECURRING_TASK_CADENCE = "Changed Recurring Task Cadence",

  // Personal Details
  CHANGED_USER_NAME = "Changed User Name",
  CHANGED_USER_COLOR_LEVEL = "Changed User Color Level",
  CHANGED_USER_ROLE = "Changed User Role",

  // User Details
  INVITED_USER = "Invited User",
  DELETED_USER = "Deleted User",

  // Pet Details
  DELETED_PET = "Deleted Pet",
  CHANGED_PET_NAME = "Changed Pet Name",
  CHANGED_PET_COLOR_LEVEL = "Changed Pet Color Level",
  CHANGED_PET_NEUTER_STATUS = "Changed Pet Neuter Status",
  CHANGED_PET_SAFETY_INFO = "Changed Pet Safety Info",
  CHANGED_PET_MEDICAL_INFO = "Changed Pet Medical Info",
  CHANGED_PET_MANAGEMENT_INFO = "Changed Pet Management Info",

  // Task Template Details
  DELETED_TASK_TEMPLATE = "Deleted Task Template",
  CHANGED_TASK_TEMPLATE_NAME = "Changed Task Template Name",
  CHANGED_TASK_TEMPLATE_INSTRUCTIONS = "Changed Task Template Instructions",
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
