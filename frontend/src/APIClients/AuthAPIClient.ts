import { signInWithEmailLink } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import auth from "../firebase";
import AUTHENTICATED_USER_KEY from "../constants/AuthConstants";
import { AuthenticatedUser, PasswordSetResponse } from "../types/AuthTypes";
import baseAPIClient from "./BaseAPIClient";
import {
  getLocalStorageObjProperty,
  setLocalStorageObjProperty,
  clearLocalStorageKey
} from "../utils/LocalStorageUtils";
import { DecodedJWT } from "../types/AuthTypes";

const login = async (
  email: string,
  password: string,
): Promise<AuthenticatedUser> => {
  try {
    const { data } = await baseAPIClient.post(
      "/auth/login",
      { email, password },
      { withCredentials: true },
    );
    localStorage.setItem(AUTHENTICATED_USER_KEY, JSON.stringify(data));
    return data;
  } catch (error) {
    return null;
  }
};

const loginWithSignInLink = async (
  url: string,
  email: string,
): Promise<AuthenticatedUser> => {
  try {
    const result = await signInWithEmailLink(auth, email, url);
    const accessToken = await result.user.getIdToken();
    const { refreshToken } = result.user;
    const { data } = await baseAPIClient.post(
      "/auth/loginWithSignInLink",
      { accessToken, refreshToken, email },
      { withCredentials: true },
    );
    localStorage.setItem(AUTHENTICATED_USER_KEY, JSON.stringify(data));
    return data;
  } catch (error) {
    if (error instanceof FirebaseError) {
      if (
        error.code === "auth/invalid-action-code" ||
        error.code === "auth/expired-action-code"
      ) {
        // TODO: deprecate console use in frontend
        /* eslint-disable-next-line no-console */
        console.log(
          `Attempt to use invalidated sign-in link, ask administrator for new link: ${error.message}`,
        ); // link has already been used once or has expired
      }
      // email has already been validated and user shouldn't be disabled, so auth/invalid-email and auth/user-disabled isn't checked
    }
    return null;
  }
};

const logout = async (userId: number | undefined): Promise<boolean> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    await baseAPIClient.post(
      `/auth/logout/${userId}`,
      {},
      { headers: { Authorization: bearerToken } },
    );
    localStorage.removeItem(AUTHENTICATED_USER_KEY);
    return true;
  } catch (error) {
    return false;
  }
};

const register = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string,
): Promise<AuthenticatedUser> => {
  try {
    const { data } = await baseAPIClient.post(
      "/auth/register",
      { firstName, lastName, email, password },
      { withCredentials: true },
    );
    localStorage.setItem(AUTHENTICATED_USER_KEY, JSON.stringify(data));
    return data;
  } catch (error) {
    return null;
  }
};

const sendPasswordResetEmail = async (
  email: string | undefined,
): Promise<boolean> => {
  try {
    await baseAPIClient.post(`/auth/send-password-reset-email/${email}`);
    return true;
  } catch (error) {
    return false;
  }
};

const refresh = async (): Promise<boolean> => {
  try {
    console.log(AUTHENTICATED_USER_KEY);
    const { data } = await baseAPIClient.post(
      "/auth/refresh",
      {},
      { withCredentials: true },
    );

    if(typeof data === "string") {
      throw "error"
    }

    // update stored access token
    setLocalStorageObjProperty(
      AUTHENTICATED_USER_KEY,
      "accessToken",
      data.accessToken,
    );

    return true;
  } catch (error) {
    // refresh failed — clear context and local storage
    console.log(AUTHENTICATED_USER_KEY);
    clearLocalStorageKey(AUTHENTICATED_USER_KEY);
    return false;
  }
};

const getEmailOfCurrentUser = async (): Promise<string> => {
  const email = getLocalStorageObjProperty(AUTHENTICATED_USER_KEY, "email");
  if (typeof email === "string") {
    return email;
  }
  throw new Error("Email not found for the current user");
};

const setPassword = async (
  newPassword: string,
): Promise<PasswordSetResponse> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    const email = await getEmailOfCurrentUser();
    // set password
    const response = await baseAPIClient.post(
      `/auth/setPassword/${email}`,
      { newPassword },
      { headers: { Authorization: bearerToken } },
    );
    return response.data;
  } catch (error) {
    return { success: false, errorMessage: "An unknown error occured." };
  }
};

// Gets your access token from the cookies
const getAccessToken = () : string | null => {
  try{
    const accessToken = String(getLocalStorageObjProperty(AUTHENTICATED_USER_KEY, "accessToken"));
    return accessToken;
  } catch(error){
    return null;
  }
}

// Checks if the access token has expired or not
const validateAccessToken = (decodedToken : DecodedJWT) : boolean => {
  // Check if expired
  const result = (decodedToken &&
    // If it a string (and not an object) then something went wrong
    (typeof decodedToken === "string" || 
      // Checks the time of expiration in seconds (division by 1000 because its in ms)
      decodedToken.exp <= Math.round(new Date().getTime() / 1000)))
  return !Boolean(result);
}

export default {
  login,
  loginWithSignInLink,
  logout,
  register,
  sendPasswordResetEmail,
  refresh,
  setPassword,
  getEmailOfCurrentUser,
  getAccessToken,
  validateAccessToken,
};
