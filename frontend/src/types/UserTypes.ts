export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: "Administrator" | "Animal Behaviourist" | "Staff" | "Volunteer";
  status: string;
  colorLevel?: "Blue" | "Red" | "Orange" | "Yellow" | "Green" | null;
  animalTags?: ["Bird" | "Bunny" | "Cat" | "Dog" | "Small Animal"] | null;
  canSeeAllLogs?: boolean | null;
  canAssignUsersToTasks?: boolean | null;
  phoneNumber?: string | null;
  profilePhoto?: string;
};

export type CreateUserDTO = Omit<
  User,
  "id" | "status" | "animalTags" | "profilePhoto"
>;
