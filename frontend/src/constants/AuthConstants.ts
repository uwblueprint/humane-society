const AUTHENTICATED_USER_KEY = `${window.location.hostname}:AUTHENTICATED_USER`;

export default AUTHENTICATED_USER_KEY;

export const ALL_ROLES = new Set<string>([
  "Administrator",
  "Animal Behaviourist",
  "Staff",
  "Volunteer",
]);

export const ADMIN_AND_BEHAVIOURISTS = new Set<string>([
  "Administrator",
  "Animal Behaviourist",
]);

export const STAFF_BEHAVIOURISTS_ADMIN = new Set<string>([
  "Staff",
  "Administrator",
  "Animal Behaviourist",
]);

export const ADMIN = "Administrator";
export const BEHAVIOURIST = "Animal Behaviourist";
export const STAFF = "Staff";

export const STATUS = new Set<string>(["Active", "Invited"]);
