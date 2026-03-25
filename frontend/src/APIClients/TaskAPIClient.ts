import baseAPIClient from "./BaseAPIClient";
import AUTHENTICATED_USER_KEY from "../constants/AuthConstants";
import { getLocalStorageObjProperty } from "../utils/LocalStorageUtils";
import { ScheduledTaskDTO, PetTask, RecurrenceTask } from "../types/TaskTypes";

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

export const getPetTasksByDate = async (
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

export default {
  getTask,
  getRecurrence,
  getAllTasks,
  getUserTasks,
  getPetTasks,
};
