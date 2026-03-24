import { InteractionDTO } from "../types/InteractionTypes";
import AUTHENTICATED_USER_KEY from "../constants/AuthConstants";
import baseAPIClient from "./BaseAPIClient";
import { getLocalStorageObjProperty } from "../utils/LocalStorageUtils";

const getInteractions = async (): Promise<InteractionDTO[]> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;

  try {
    const { data } = await baseAPIClient.get("/interactions", {
      headers: { Authorization: bearerToken },
    });
    return data;
  } catch (error) {
    throw new Error(
      `Failed to get interactions. ${
        error instanceof Error ? error.message : "Unknown error occurred."
      }`,
    );
  }
};

export default {
  getInteractions,
};
