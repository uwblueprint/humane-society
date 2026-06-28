import axios from "axios";
import AUTHENTICATED_USER_KEY from "../constants/AuthConstants";
import { Pet, PetListSections, PetRequestDTO } from "../types/PetTypes";
import { Task } from "../types/TaskTypes";
import { getLocalStorageObjProperty } from "../utils/LocalStorageUtils";
import baseAPIClient from "./BaseAPIClient";
import { InteractionType } from "../types/InteractionTypes";

/** Backend often responds with plain text for validation errors, not `{ error: string }`. */
const getCreatePetErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : "Something went wrong.";
  }

  const { response } = error;
  if (!response) {
    return "Network error. Check your connection and try again.";
  }

  const { status, data } = response;

  if (status === 413) {
    return "Upload too large. Remove or shrink the profile photo, or try again without a photo.";
  }

  if (typeof data === "string" && data.trim()) {
    return data.trim();
  }

  if (data && typeof data === "object" && !Array.isArray(data)) {
    const body = data as Record<string, unknown>;
    if (typeof body.error === "string") return body.error;
    if (typeof body.message === "string") return body.message;
  }

  if (status >= 500) {
    return "Server error while saving the pet. Please try again later.";
  }

  if (status === 400) {
    return "Could not save the pet. Check name, colour level, animal tag, and other fields, then try again.";
  }

  return error.message;
};

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

const deletePet = async (
  petId: number | string,
  body?: {
    actorId: number;
    targetId: number;
    animalTag: string;
    petName: string;
  },
): Promise<void> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    await baseAPIClient.delete(`/pets/${petId}`, {
      headers: { Authorization: bearerToken },
      data: { ...body, interactionType: InteractionType.DELETED_PET },
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error(`Failed to delete pet '${error}'`);
  }
};

const createPet = async (petData: PetRequestDTO): Promise<Pet> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    const { data } = await baseAPIClient.post("/pets", petData, {
      headers: { Authorization: bearerToken },
    });
    return data;
  } catch (error) {
    throw new Error(getCreatePetErrorMessage(error));
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

const updateName = async (
  petId: number,
  body: {
    name: string;
    actorId: number;
    targetId: number;
    // NOTE: backend CHANGED_PET_NAME case reads old/newUserName (quirk in logInteraction)
    oldUserName: string;
    newUserName: string;
  },
): Promise<Pet> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    const { data } = await baseAPIClient.patch(
      `/pets/${petId}/name`,
      { ...body, interactionType: InteractionType.CHANGED_PET_NAME },
      { headers: { Authorization: bearerToken } },
    );
    return data;
  } catch (error) {
    throw new Error(`Failed to update pet name: ${error}`);
  }
};

const updateColorLevel = async (
  petId: number,
  body: {
    colorLevel: number;
    actorId: number;
    targetId: number;
    petName: string;
    oldColorLevel: string;
    newColorLevel: string;
  },
): Promise<Pet> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    const { data } = await baseAPIClient.patch(
      `/pets/${petId}/color-level`,
      { ...body, interactionType: InteractionType.CHANGED_PET_COLOR_LEVEL },
      { headers: { Authorization: bearerToken } },
    );
    return data;
  } catch (error) {
    throw new Error(`Failed to update pet color level: ${error}`);
  }
};

const updateNeuterStatus = async (
  petId: number,
  body: {
    neutered: boolean | null;
    actorId: number;
    targetId: number;
    petName: string;
    oldText: string;
    newText: string;
  },
): Promise<Pet> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    const { data } = await baseAPIClient.patch(
      `/pets/${petId}/neuter-status`,
      { ...body, interactionType: InteractionType.CHANGED_PET_NEUTER_STATUS },
      { headers: { Authorization: bearerToken } },
    );
    return data;
  } catch (error) {
    throw new Error(`Failed to update pet neuter status: ${error}`);
  }
};

const updateSafetyInfo = async (
  petId: number,
  body: {
    safetyInfo: string | null;
    actorId: number;
    targetId: number;
    petName: string;
    oldText: string;
    newText: string;
  },
): Promise<Pet> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    const { data } = await baseAPIClient.patch(
      `/pets/${petId}/safety-info`,
      { ...body, interactionType: InteractionType.CHANGED_PET_SAFETY_INFO },
      { headers: { Authorization: bearerToken } },
    );
    return data;
  } catch (error) {
    throw new Error(`Failed to update pet safety info: ${error}`);
  }
};

const updateMedicalInfo = async (
  petId: number,
  body: {
    medicalInfo: string | null;
    actorId: number;
    targetId: number;
    petName: string;
    oldText: string;
    newText: string;
  },
): Promise<Pet> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    const { data } = await baseAPIClient.patch(
      `/pets/${petId}/medical-info`,
      { ...body, interactionType: InteractionType.CHANGED_PET_MEDICAL_INFO },
      { headers: { Authorization: bearerToken } },
    );
    return data;
  } catch (error) {
    throw new Error(`Failed to update pet medical info: ${error}`);
  }
};

const updateManagementInfo = async (
  petId: number,
  body: {
    managementInfo: string | null;
    actorId: number;
    targetId: number;
    petName: string;
    oldText: string;
    newText: string;
  },
): Promise<Pet> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    const { data } = await baseAPIClient.patch(
      `/pets/${petId}/management-info`,
      { ...body, interactionType: InteractionType.CHANGED_PET_MANAGEMENT_INFO },
      { headers: { Authorization: bearerToken } },
    );
    return data;
  } catch (error) {
    throw new Error(`Failed to update pet management info: ${error}`);
  }
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

export default {
  getPetTasks,
  getPet,
  getPets,
  getPetList,
  getProfilePhotoUrl,
  setDefaultProfilePhoto,
  uploadProfilePhoto,
  createPet,
  update,
  deletePet,
  updateName,
  updateColorLevel,
  updateNeuterStatus,
  updateSafetyInfo,
  updateMedicalInfo,
  updateManagementInfo,
};
