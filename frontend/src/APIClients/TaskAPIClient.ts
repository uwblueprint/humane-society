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

export default { getTask, getAllTasks };
