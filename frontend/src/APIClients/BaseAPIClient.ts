import axios, { AxiosRequestConfig } from "axios";
import { jwtDecode } from "jwt-decode";
import { DecodedJWT } from "../types/AuthTypes";
import {
  refreshAccessToken,
  validateAccessToken,
  getAccessToken,
} from "../utils/AuthUtils";

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

  // Get access token
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
    if (!validateAccessToken(decodedToken)) {
      const refreshCode = await refreshAccessToken();

      if (refreshCode) {
        const accessToken = getAccessToken();
        newConfig.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
  }

  return newConfig;
});

export default baseAPIClient;
