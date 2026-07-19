import UserRoles from "../constants/UserConstants";

// Mirrors the field-level guards in backend/typescript/rest/userRoutes.ts (PUT /:userId).
// Keep these two sets in sync with userUpdatableSet / behaviouristUpdatableSet there.
const SELF_EDITABLE_FIELDS = new Set([
  "firstName",
  "lastName",
  "phoneNumber",
  "profilePhoto",
]);
const BEHAVIOURIST_OTHER_EDITABLE_FIELDS = new Set([
  "colorLevel",
  "animalTags",
]);

const ALL_EDITABLE_FIELDS = [
  "firstName",
  "lastName",
  "phoneNumber",
  "role",
  "colorLevel",
  "animalTags",
  "profilePhoto",
];

export const canViewProfile = (
  actorRole: UserRoles | null | undefined,
  isOwnProfile: boolean,
): boolean => {
  if (isOwnProfile) return true;
  return actorRole !== UserRoles.VOLUNTEER;
};

export const canEditField = (
  actorRole: UserRoles | null | undefined,
  isOwnProfile: boolean,
  field: string,
): boolean => {
  if (actorRole === UserRoles.ADMIN) {
    return field === "profilePhoto" ? isOwnProfile : true;
  }
  if (isOwnProfile) {
    return SELF_EDITABLE_FIELDS.has(field);
  }
  if (actorRole === UserRoles.BEHAVIOURIST) {
    return BEHAVIOURIST_OTHER_EDITABLE_FIELDS.has(field);
  }
  return false;
};

export const canEditProfile = (
  actorRole: UserRoles | null | undefined,
  isOwnProfile: boolean,
): boolean => {
  return ALL_EDITABLE_FIELDS.some((field) =>
    canEditField(actorRole, isOwnProfile, field),
  );
};

export const canDeleteUser = (
  actorRole: UserRoles | null | undefined,
  isOwnProfile: boolean,
): boolean => {
  return actorRole === UserRoles.ADMIN && !isOwnProfile;
};

// True when a password-related action should show: a self "Change Password" link,
// or (for admins editing someone else) a "Send Password Reset Email" action.
export const canChangePassword = (
  actorRole: UserRoles | null | undefined,
  isOwnProfile: boolean,
): boolean => {
  return isOwnProfile || actorRole === UserRoles.ADMIN;
};

// Resending an invite/verification email to a still-Invited user.
export const canResendVerificationEmail = (
  actorRole: UserRoles | null | undefined,
): boolean => {
  return actorRole === UserRoles.ADMIN || actorRole === UserRoles.BEHAVIOURIST;
};
