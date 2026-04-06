import axios from "axios";
import AUTHENTICATED_USER_KEY from "../constants/AuthConstants";
import { Pet, PetListSections, PetRequestDTO } from "../types/PetTypes";
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

const deletePet = async (petId: number | string): Promise<void> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    await baseAPIClient.delete(`/pets/${petId}`, {
      headers: { Authorization: bearerToken },
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error(`Failed to delete pet '${error}'`);
  }
};

const update = async (petId: number, formData: PetRequestDTO): Promise<Pet> => {  
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;

  const { data } = await baseAPIClient.put(`/pets/${petId}`, formData, {
    headers: { Authorization: bearerToken },
  });

  return data;
};

const uploadProfilePhoto = async (file: File, petId: number, oldStoragePath?: string): Promise<string> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  
  try {
    const formData = new FormData();

    formData.append("file", file);
    if (oldStoragePath) {
      formData.append("oldStoragePath", oldStoragePath);
    }
    const res = await baseAPIClient.post(`/pets/${petId}/profile-photo/upload`, 
      formData,
      {
      headers: { Authorization: bearerToken }, 
    });

    if (typeof res.data.storagePath !== "string") throw new Error(`Failed to get profile photo url`);

    return res.data.storagePath;
  } catch (error) {
    throw new Error(`Failed to set new profile photo: ${error}`);
  }
}

const setDefaultProfilePhoto = async (petId: number) => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    const res = await baseAPIClient.post(`/pets/${petId}/profile-photo/default`, {
      headers: { Authorization: bearerToken },
    });

    if (res.status !== 200) throw new Error(`Failed to set default profile photo`);
  } catch (error) {
    throw new Error(`Failed to set default profile photo: ${error}`);
  }
}

const getProfilePhotoUrl = async (petId: number): Promise<string> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    const res = await baseAPIClient.get(`/pets/${petId}/profile-photo`, {
      headers: { Authorization: bearerToken },
    });

    if (typeof res.data.url !== "string") throw new Error(`Failed to get profile photo url`);

    return res.data.url;
  } catch (error) {
    throw new Error(`Failed to get profile photo url: ${error}`);
  }
}

export default { getPetTasks, getPet, getPets, getPetList, getProfilePhotoUrl, setDefaultProfilePhoto, uploadProfilePhoto, update, deletePet };
