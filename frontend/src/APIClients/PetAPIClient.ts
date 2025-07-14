import baseAPIClient from "./BaseAPIClient";
import { getLocalStorageObjProperty } from "../utils/LocalStorageUtils";
import AUTHENTICATED_USER_KEY from "../constants/AuthConstants";
import { PetInfo } from "../components/pet-list/PetListTableSection";
import { colorLevelMap } from "../types/TaskTypes";

// Map backend pet to frontend PetInfo
function mapPetToPetInfo(pet: any): PetInfo {
  return {
    id: pet.id,
    name: pet.name,
    skill: colorLevelMap[pet.colorLevel] || "Green",
    image: pet.photo || "/images/dog1.png", // fallback image
    taskCategories: pet.taskCategories || [], // backend may need to provide this
    status: pet.status,
    lastCaredFor: pet.lastCaredFor || "-", // backend may need to provide this
    allTasksAssigned: pet.allTasksAssigned ?? true, // backend may need to provide this
    animalTag: pet.animalTag,
  };
}

const get = async (): Promise<PetInfo[]> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    const { data } = await baseAPIClient.get("/pets", {
      headers: { Authorization: bearerToken },
    });
    // Map backend data to PetInfo[]
    return Array.isArray(data) ? data.map(mapPetToPetInfo) : [];
  } catch (error) {
    throw new Error(
      `Failed to get pets. ${
        error instanceof Error ? error.message : "Unknown error occurred."
      }`,
    );
  }
};

export default { get };

