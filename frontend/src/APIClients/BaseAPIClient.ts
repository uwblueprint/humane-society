import axios, { AxiosRequestConfig } from "axios";
import { jwtDecode } from "jwt-decode";

import AUTHENTICATED_USER_KEY from "../constants/AuthConstants";
import { DecodedJWT } from "../types/AuthTypes";
import { setLocalStorageObjProperty } from "../utils/LocalStorageUtils";

const baseAPIClient = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
});

baseAPIClient.interceptors.request.use(async (config: AxiosRequestConfig) => {
  const newConfig = { ...config };

<<<<<<< HEAD
  // if access token in header has expired, do a refresh
  const authHeader = config.headers?.Authorization;
  const authHeaderParts =
    typeof authHeader === "string" ? authHeader.split(" ") : null;
  if (
    config.headers && // Add this check
    authHeaderParts &&
    authHeaderParts.length >= 2 &&
    authHeaderParts[0].toLowerCase() === "bearer"
  ) {
    const decodedToken = jwtDecode(authHeaderParts[1]) as DecodedJWT;
=======
  // Initialize newConfig.headers if it's undefined.
  // This ensures that we can set properties on it later, like Authorization.
  if (!newConfig.headers) {
    newConfig.headers = {};
  }
>>>>>>> e4a3909d14e6100f60315f0391fa59a9cc9baa1c

  // Check if config.headers and config.headers.Authorization are present and Authorization is a string
  // This addresses:
  // TS18048: 'config.headers' is possibly 'undefined'.
  // TS2339: Property 'split' does not exist on type 'HeaderValue | ...'.
  if (config.headers && typeof config.headers.Authorization === "string") {
    const authHeaderParts = config.headers.Authorization.split(" ");
    if (
      authHeaderParts && // Retaining original check for robustness
      authHeaderParts.length >= 2 &&
      authHeaderParts[0].toLowerCase() === "bearer"
    ) {
      const decodedToken = jwtDecode(authHeaderParts[1]) as DecodedJWT;

      if (
        decodedToken &&
        (typeof decodedToken === "string" ||
          decodedToken.exp <= Math.round(new Date().getTime() / 1000))
      ) {
        const { data } = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

<<<<<<< HEAD
      if (!newConfig.headers) {
        newConfig.headers = {};
      }
      newConfig.headers.Authorization = accessToken;
=======
        const accessToken = data.accessToken || data.access_token;
        setLocalStorageObjProperty(
          AUTHENTICATED_USER_KEY,
          "accessToken",
          accessToken,
        );

        // newConfig.headers is guaranteed to be an object here due to the initialization above.
        // This addresses: TS18048: 'newConfig.headers' is possibly 'undefined'.
        newConfig.headers.Authorization = accessToken;
      }
>>>>>>> e4a3909d14e6100f60315f0391fa59a9cc9baa1c
    }
  }

  return newConfig;
});

export default baseAPIClient;
