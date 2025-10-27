import baseAPIClient from "./BaseAPIClient";
import AUTHENTICATED_USER_KEY from "../constants/AuthConstants";
import { getLocalStorageObjProperty } from "../utils/LocalStorageUtils";
import { Task } from "../types/TaskTypes";

const getAuthHeader = () => ({
  Authorization: `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`,
});

const getTask = async ({
  taskId,
}: {
  taskId: number;
}): Promise<Task> => {
  try {
    const { data } = await baseAPIClient.get(`/tasks/${taskId}`, {
      headers: getAuthHeader(),
    });
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch task: ${error}`);
  }
};

const getAllTasks = async (): Promise<Task[]> => {
  try {
    const { data } = await baseAPIClient.get("/tasks", {
      headers: getAuthHeader(),
    });
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch tasks: ${error}`);
  }
};

export default { getTask, getAllTasks };
