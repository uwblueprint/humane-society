import axios, { AxiosRequestConfig } from "axios";
import { jwtDecode } from "jwt-decode";

import { LOGIN_PAGE } from "../constants/Routes";
import AUTHENTICATED_USER_KEY from "../constants/AuthConstants";
import { DecodedJWT } from "../types/AuthTypes";
import { setLocalStorageObjProperty } from "../utils/LocalStorageUtils";


const baseAPIClient = axios.create({ // create a custom url to connect fe and be
  baseURL: process.env.REACT_APP_BACKEND_URL,
});

baseAPIClient.interceptors.request.use(async (config: AxiosRequestConfig) => { // every single time baseapi is used, this will run
  try { 
    const newConfig = { ...config };

    // if access token in header has expired, do a refresh
    const authHeader = config.headers?.Authorization; // grabs authorization from header
    const authHeaderParts =
      typeof authHeader === "string" ? authHeader.split(" ") : null; // either splits header into two parts or null if no value is found
    if (
      config.headers && // if header exists
      authHeaderParts && // and header parts exist
      authHeaderParts.length >= 2 && // it is not null 
      authHeaderParts[0].toLowerCase() === "bearer" // the first word of of split is header aut
    ) {
      const decodedToken = jwtDecode(authHeaderParts[1]) as DecodedJWT; // decode second half of the token 

      if (
        decodedToken && // if decoded token exists
        (typeof decodedToken === "string" || // if token is a string (and not an object) OR it is expired
          decodedToken.exp <= Math.round(new Date().getTime() / 1000))
      ) {
        const { data } = await axios.post( // use data and refresh token
          `${process.env.REACT_APP_BACKEND_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const accessToken = data.accessToken || data.access_token; // save accessToken or access_token
        setLocalStorageObjProperty( // in local storage, set access token as token
          AUTHENTICATED_USER_KEY,
          "accessToken",
          accessToken,
        );

        if (!newConfig.headers) { // if there are no headers
          newConfig.headers = {}; // initalize header 
        }
        newConfig.headers.Authorization = accessToken; // set authorization to access token
      }
    }
    return newConfig; // return config
  } catch (error) {
    window.location.replace(LOGIN_PAGE);
}

});

export default baseAPIClient;
