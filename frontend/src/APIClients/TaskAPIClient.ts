import baseAPIClient from "./BaseAPIClient";
import AUTHENTICATED_USER_KEY from "../constants/AuthConstants";
import { getLocalStorageObjProperty } from "../utils/LocalStorageUtils";
import { ScheduledTaskDTO, PetTask, RecurrenceTask } from "../types/TaskTypes";
import { InteractionType } from "../types/InteractionTypes";

const getTask = async (taskId: number): Promise<PetTask> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    const { data } = await baseAPIClient.get(`/tasks/${taskId}`, {
      headers: { Authorization: bearerToken },
    });
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch task: ${error}`);
  }
};

const getRecurrence = async (
  taskId: number,
): Promise<RecurrenceTask | null> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    const { data } = await baseAPIClient.get(`/tasks/${taskId}/recurrence`, {
      headers: { Authorization: bearerToken },
    });
    return data;
  } catch (error) {
    return null;
  }
};

const getAllTasks = async (): Promise<PetTask[]> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    const { data } = await baseAPIClient.get("/tasks", {
      headers: { Authorization: bearerToken },
    });
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch tasks: ${error}`);
  }
};

const getPetTasksByDate = async (
  petId: number,
  date: string,
): Promise<ScheduledTaskDTO[]> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    const { data } = await baseAPIClient.get("/tasks/date", {
      headers: { Authorization: bearerToken },
      params: { date, petId },
    });
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch tasks: ${error}`);
  }
};

const getUserTasks = async (userId: number): Promise<PetTask[]> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    const { data } = await baseAPIClient.get(`/tasks/user/${userId}`, {
      headers: { Authorization: bearerToken },
    });
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch user tasks: ${error}`);
  }
};

const getPetTasks = async (petId: number): Promise<PetTask[]> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    const { data } = await baseAPIClient.get(`/tasks/pet/${petId}`, {
      headers: { Authorization: bearerToken },
    });
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch pet tasks: ${error}`);
  }
};

// Resolve which assignment interaction occurred from the before/after state.
const resolveAssignInteractionType = (
  previousUserId: number | null,
  newUserId: number | null,
  actorId: number,
): InteractionType | null => {
  if (previousUserId === newUserId) return null; // no change
  if (previousUserId === null && newUserId !== null) {
    return newUserId === actorId
      ? InteractionType.SELF_ASSIGNED_TASK
      : InteractionType.ASSIGNED_TASK;
  }
  if (previousUserId !== null && newUserId === null) {
    return InteractionType.UNASSIGNED_TASK;
  }
  return InteractionType.CHANGED_TASK_ASSIGNEE;
};

const assignUser = async (
  taskId: number,
  userId: number | null,
  interaction?: {
    previousUserId: number | null;
    actorId: number;
    targetId: number;
    taskTemplateName: string;
    petName: string;
    oldUserName?: string;
    newUserName?: string;
    actorName?: string;
  },
): Promise<void> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    const payload: Record<string, unknown> = { userId };
    if (interaction) {
      const interactionType = resolveAssignInteractionType(
        interaction.previousUserId,
        userId,
        interaction.actorId,
      );
      Object.assign(payload, interaction, { interactionType });
    }
    await baseAPIClient.patch(`/tasks/${taskId}/assign-user`, payload, {
      headers: { Authorization: bearerToken },
    });
  } catch (error) {
    throw new Error(`Failed to assign user: ${error}`);
  }
};

const scheduleTask = async (
  taskId: number,
  body: {
    scheduledStartTime: string;
    actorId: number;
    targetId: number;
    taskTemplateName: string;
    petName: string;
    oldDate: string;
    newDate: string;
  },
): Promise<void> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    await baseAPIClient.patch(
      `/tasks/${taskId}/start-date`,
      { ...body, interactionType: InteractionType.CHANGED_TASK_START_DATE },
      { headers: { Authorization: bearerToken } },
    );
  } catch (error) {
    throw new Error(`Failed to schedule task: ${error}`);
  }
};

const startTask = async (
  taskId: number,
  body: {
    startTime: string;
    actorId: number;
    targetId: number;
    taskTemplateName: string;
    petName: string;
    actorName: string;
  },
): Promise<void> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    await baseAPIClient.patch(
      `/tasks/${taskId}/start`,
      { ...body, interactionType: InteractionType.STARTED_TASK },
      { headers: { Authorization: bearerToken } },
    );
  } catch (error) {
    throw new Error(`Failed to start task: ${error}`);
  }
};

const endTask = async (
  taskId: number,
  body: {
    endTime: string;
    actorId: number;
    targetId: number;
    taskTemplateName: string;
    petName: string;
    actorName: string;
  },
): Promise<void> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    await baseAPIClient.patch(
      `/tasks/${taskId}/end`,
      { ...body, interactionType: InteractionType.COMPLETED_TASK },
      { headers: { Authorization: bearerToken } },
    );
  } catch (error) {
    throw new Error(`Failed to end task: ${error}`);
  }
};

const updateNotes = async (
  taskId: number,
  body: {
    notes: string;
    actorId: number;
    targetId: number;
    taskTemplateName: string;
    petName: string;
    oldInstructions: string;
    newInstructions: string;
  },
): Promise<void> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    await baseAPIClient.patch(
      `/tasks/${taskId}/notes`,
      { ...body, interactionType: InteractionType.CHANGED_TASK_INSTRUCTIONS },
      { headers: { Authorization: bearerToken } },
    );
  } catch (error) {
    throw new Error(`Failed to update task notes: ${error}`);
  }
};

const deleteTask = async (
  taskId: number,
  body?: {
    actorId: number;
    targetId: number;
    taskTemplateName: string;
    petName: string;
  },
): Promise<void> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    await baseAPIClient.delete(`/tasks/${taskId}`, {
      headers: { Authorization: bearerToken },
      data: { ...body, interactionType: InteractionType.DELETED_TASK },
    });
  } catch (error) {
    throw new Error(`Failed to delete task: ${error}`);
  }
};

const createTask = async (payload: {
  userId: number | null;
  petId: number;
  taskTemplateId: number;
  scheduledStartTime: string;
  startTime?: string;
  endTime?: string;
  notes: string;
}): Promise<void> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;

  try {
    await baseAPIClient.post("/tasks", payload, {
      headers: { Authorization: bearerToken },
    });
  } catch (error) {
    throw new Error(`Failed to create task: ${error}`);
  }
};

const createRecurringTask = async (payload: {
  task: {
    userId: number | null;
    petId: number;
    taskTemplateId: number;
    scheduledStartTime: string;
    startTime?: string;
    endTime?: string;
    notes: string;
  };
  recurrence: {
    days: string[];
    cadence: string;
    endDate: string | null;
    exclusions: string[];
  };
}): Promise<void> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    await baseAPIClient.post("/recurrences", payload, {
      headers: { Authorization: bearerToken },
    });
  } catch (error) {
    throw new Error(`Failed to create recurring task: ${error}`);
  }
};

export default {
  getTask,
  getRecurrence,
  getAllTasks,
  getPetTasksByDate,
  getUserTasks,
  getPetTasks,
  assignUser,
  scheduleTask,
  startTask,
  endTask,
  updateNotes,
  deleteTask,
  createTask,
  createRecurringTask,
};
