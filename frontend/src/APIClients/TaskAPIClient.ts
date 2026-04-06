import baseAPIClient from "./BaseAPIClient";
import AUTHENTICATED_USER_KEY from "../constants/AuthConstants";
import { getLocalStorageObjProperty } from "../utils/LocalStorageUtils";
import { ScheduledTaskDTO, Task } from "../types/TaskTypes";

const getTask = async (taskId: number): Promise<Task> => {
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

const getAllTasks = async (): Promise<Task[]> => {
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

const assignUser = async (taskId: number, userId: number): Promise<void> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    await baseAPIClient.patch(
      `/tasks/${taskId}/assign-user`,
      { userId },
      { headers: { Authorization: bearerToken } },
    );
  } catch (error) {
    throw new Error(`Failed to assign user: ${error}`);
  }
};

const createTask = async (payload: {
  userId: number | null;
  petId: number;
  taskTemplateId: number;
  scheduledStartTime: string;
  startTime: string;
  endTime: string;
  notes: string;
}): Promise<void> => {
  const bearerToken =`Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;

  try {
    await baseAPIClient.post("/tasks", payload, {
      headers: { Authorization: bearerToken },
    });
  } catch (error) {
    throw new Error(`Failed to create task: ${error}`)
  }
};

const createRecurringTask = async (payload: {
  task: {
    userId: number | null; 
    petId: number;
    taskTemplateId: number;
    scheduledStartTime: string;
    startTime: string;
    endTime: string;
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
  getAllTasks,
  getPetTasksByDate,
  assignUser,
  createTask,
  createRecurringTask,
};
