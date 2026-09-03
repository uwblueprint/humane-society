import axios, {
  AxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from "axios";
import { jwtDecode } from "jwt-decode";
import { DecodedJWT } from "../types/AuthTypes";
import {
  refreshAccessToken,
  validateAccessToken,
  getAccessToken,
  clearAccessToken,
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

// If the user tries to access restricted endpoints then redirect them
// We should be careful with the error codes since now 401 and 403 will cause redirects
// TODO: Handle permissions
baseAPIClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // clear user data
      clearAccessToken();

      // redirect to login page
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default baseAPIClient;
