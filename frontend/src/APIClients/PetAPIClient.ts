import AUTHENTICATED_USER_KEY from "../constants/AuthConstants";
import { Pet, PetListSections } from "../types/PetTypes";
import { Task } from "../types/TaskTypes";
import { getLocalStorageObjProperty } from "../utils/LocalStorageUtils";
import baseAPIClient from "./BaseAPIClient";

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
    throw new Error(
      `Failed to fetch pet tasks. ${
        error instanceof Error ? error.message : "Unknown error occurred."
      }`,
    );
  }
};

const getPet = async (petId: number): Promise<Pet> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;

  try {
    const { data } = await baseAPIClient.get(`/pets/${petId}`, {
      headers: { Authorization: bearerToken },
    });

    return data;
  } catch (error) {
    throw new Error(
      `Failed to get pet. ${
        error instanceof Error ? error.message : "Unknown error occurred."
      }`,
    );
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

const getPetList = async (userId: number): Promise<PetListSections> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;

  try {
    const { data } = await baseAPIClient.get(`/pets/list/${userId}`, {
      headers: { Authorization: bearerToken },
    });
    return data;
  } catch (error) {
    throw new Error(
      `Failed to get pet list. ${
        error instanceof Error ? error.message : "Unknown error occurred."
      }`,
    );
  }
};

export default { getPetTasks, getPet, getPets, getPetList };
