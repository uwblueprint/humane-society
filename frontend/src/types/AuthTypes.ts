export type AuthenticatedUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  colorLevel: number;
  animalTags: [string];
  canSeeAllLogs?: boolean | null;
  canAssignUsersToTasks?: boolean | null;
  phoneNumber?: string | null;
  profilePhoto?: string;
  accessToken: string;
} | null;

export type DecodedJWT =
  | string
  | null
  | { [key: string]: unknown; exp: number };

export type PasswordSetResponse = {
  success: boolean;
  errorMessage?: string;
};
