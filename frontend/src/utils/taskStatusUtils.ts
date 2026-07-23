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

// Admin/Behaviourist: unassigned+passed tasks first, then in-progress, then
// everything else, then completed last.
// Volunteer/Staff: in-progress/occupied tasks first, then tasks assigned to
// me, then unassigned/inactive tasks, then everything else, then completed.
export const getTaskSortRank = (
  task: TaskLike,
  authenticatedUser?: AuthenticatedUser,
): number => {
  const isCompleted = !!task.endTime;
  const isAssigned = !!task.userId;
  const isStarted = !!task.startTime;
  const isPastStartTime = task.scheduledStartTime
    ? new Date(task.scheduledStartTime) < new Date()
    : false;

  if (
    authenticatedUser?.role === UserRoles.ADMIN ||
    authenticatedUser?.role === UserRoles.BEHAVIOURIST
  ) {
    if (isCompleted) return 3;
    if (!isAssigned && isPastStartTime) return 0;
    if (isStarted) return 1;
    return 2;
  }

  const isMine = isAssigned && task.userId === authenticatedUser?.id;
  if (isCompleted) return 4;
  if (isStarted) return 0;
  if (isMine) return 1;
  if (!isAssigned || isPastStartTime) return 2;
  return 3;
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
