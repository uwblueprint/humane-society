export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: "Administrator" | "Animal Behaviourist" | "Staff" | "Volunteer";
  status: string;
  skillLevel?: number | null;
  canSeeAllLogs?: boolean | null;
  canAssignUsersToTasks?: boolean | null;
  phoneNumber?: string | null;
};

export type CreateUserDTO = Omit<User, "id" | "status">;
