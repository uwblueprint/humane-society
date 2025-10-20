import axios, { AxiosRequestConfig } from "axios";
import { jwtDecode } from "jwt-decode";

import AUTHENTICATED_USER_KEY from "../constants/AuthConstants";
import { DecodedJWT } from "../types/AuthTypes";
import { setLocalStorageObjProperty, getLocalStorageObjProperty } from "../utils/LocalStorageUtils";

const API_BASE = process.env.REACT_APP_BACKEND_URL || "";

const baseAPIClient = axios.create({
  baseURL: API_BASE,
});

baseAPIClient.interceptors.request.use(async (config: AxiosRequestConfig) => {
  const newConfig = { ...config };

  // Ensure headers exist
  if (!newConfig.headers) {
    newConfig.headers = {};
  }

  // if access token in header has expired, do a refresh
  const authHeader = config.headers?.Authorization;
  const headerString = typeof authHeader === "string" ? authHeader : undefined;
  const authHeaderParts = headerString?.trim().split(/\s+/) ?? [];
  // Check that authHeaderParts is in the [scheme, token] format
  if (
    config.headers && // Add this check
    authHeaderParts &&
    authHeaderParts.length >= 2 &&
    authHeaderParts[0].toLowerCase() === "bearer"
  ) {
    const decodedToken = jwtDecode(authHeaderParts[1]) as DecodedJWT;

    // Check if the access_token is expired, if it is then request a refresh 
    if (
      decodedToken &&
      (typeof decodedToken === "string" ||
        // Checks the time of expiration in seconds (division by 1000 because its in ms)
        decodedToken.exp <= Math.round(new Date().getTime() / 1000))
    ) {
      const { data } = await axios.post(
        `${API_BASE}/auth/refresh`,
        {},
        { withCredentials: true },
      );

      // Bro why is there two spellings
      // TODO: fix for consitency 
      const accessToken = data.accessToken || data.access_token;
      setLocalStorageObjProperty(
        AUTHENTICATED_USER_KEY,
        "accessToken",
        accessToken,
      );

      if (!newConfig.headers) {
        newConfig.headers = {};
      }
      newConfig.headers.Authorization = "Bearer " + accessToken;
    }
  }

  return newConfig;
});

export default baseAPIClient;
