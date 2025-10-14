import baseAPIClient from "./BaseAPIClient";
import AUTHENTICATED_USER_KEY from "../constants/AuthConstants";
import { getLocalStorageObjProperty } from "../utils/LocalStorageUtils";
import { Task } from "../types/TaskTypes";
import { Pet } from "../types/PetTypes";

const getPetTasks = async (petId: number): Promise<Task[]> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    const { data } = await baseAPIClient.get(`/pets/${petId}/tasks`, {
      headers: { Authorization: bearerToken },
    });
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch pet tasks: ${error}`);
  }
};

const getPets = async (): Promise<Pet[]> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;

  try {
    const { data } = await baseAPIClient.get("/pets", {
      headers: { Authorization: bearerToken },
    });
    return data;
  } catch (error) {
    throw new Error(
      `Failed to get pets. ${
        error instanceof Error ? error.message : "Unknown error occurred."
      }`,
    );
  }
};

export default { getPetTasks, getPets };
