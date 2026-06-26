import { AuthenticatedUser } from "../types/AuthTypes";
import UserRoles from "../constants/UserConstants";

export type TaskLike = {
  userId?: number;
  startTime?: Date | string;
  endTime?: Date | string;
  scheduledStartTime?: Date | string;
};

export const isPastDay = (date?: Date | string): boolean => {
  if (!date) return false;
  const d = new Date(date);
  const now = new Date();
  return (
    new Date(d.getFullYear(), d.getMonth(), d.getDate()) <
    new Date(now.getFullYear(), now.getMonth(), now.getDate())
  );
};

export const isToday = (date?: Date | string): boolean => {
  if (!date) return false;
  const d = new Date(date);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

export const getTaskDetailedStatus = (
  task: TaskLike | null,
  authenticatedUser?: AuthenticatedUser,
):
  | "Completed"
  | "Incomplete"
  | "In-Progress"
  | "Occupied"
  | "Assigned"
  | null => {
  if (!task) return null;
  if (task.endTime) return "Completed";
  if (isPastDay(task.scheduledStartTime)) return "Incomplete";
  if (task.startTime) {
    if (
      authenticatedUser?.role === UserRoles.ADMIN ||
      authenticatedUser?.role === UserRoles.BEHAVIOURIST
    )
      return "In-Progress";
    return task.userId === authenticatedUser?.id ? "In-Progress" : "Occupied";
  }
  if (task.userId) return "Assigned";
  return null;
};
