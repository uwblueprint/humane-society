import baseAPIClient from "./BaseAPIClient";
import { Task } from "../types/TaskTypes";

const getPetTasks = async (petId: number): Promise<Task[]> => {
  try {
    const { data } = await baseAPIClient.get(`/pets/${petId}/tasks`);
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch pet tasks: ${error}`);
  }
};

export default { getPetTasks };
