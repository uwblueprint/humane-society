import axios from "axios";
import { DecodedJWT } from "../types/AuthTypes";
import {
  getLocalStorageObjProperty,
  setLocalStorageObjProperty,
  clearLocalStorageKey,
} from "./LocalStorageUtils";
import AUTHENTICATED_USER_KEY from "../constants/AuthConstants";

const API_BASE = process.env.REACT_APP_BACKEND_URL || "";

// Refreshes the access token
// The reason its here and not in AuthAPIClient is because it creates a cyclic dependanyc with BaseAPIClient
export const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const { data } = await axios.post(
      `${API_BASE}/auth/refresh`,
      {},
      { withCredentials: true },
    );

    // update stored access token
    setLocalStorageObjProperty(
      AUTHENTICATED_USER_KEY,
      "accessToken",
      data.accessToken,
    );

    return true;
  } catch (error) {
    // Clear the access token cookie
    clearLocalStorageKey(AUTHENTICATED_USER_KEY);
    return false;
  }
};

// Gets your access token from the cookies
export const getAccessToken = (): string | null => {
  try {
    const accessToken = String(
      getLocalStorageObjProperty(AUTHENTICATED_USER_KEY, "accessToken"),
    );
    return accessToken;
  } catch (error) {
    return null;
  }
};

// Checks if the access token has expired or not
export const validateAccessToken = (decodedToken: DecodedJWT): boolean => {
  // Check if expired
  const result =
    decodedToken &&
    // If it a string (and not an object) then something went wrong
    (typeof decodedToken === "string" ||
      // Checks the time of expiration in seconds (division by 1000 because its in ms)
      decodedToken.exp <= Math.round(new Date().getTime() / 1000));
  return !result;
};
