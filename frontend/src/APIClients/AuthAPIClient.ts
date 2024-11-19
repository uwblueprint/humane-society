import { signInWithEmailLink } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import auth from "../firebase/firebase";
import AUTHENTICATED_USER_KEY from "../constants/AuthConstants";
import { AuthenticatedUser } from "../types/AuthTypes";
import baseAPIClient from "./BaseAPIClient";
import {
  getLocalStorageObjProperty,
  setLocalStorageObjProperty,
} from "../utils/LocalStorageUtils";

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
  } catch (error: unknown) {
    if (error instanceof FirebaseError) {
      if (
        error.code === "auth/invalid-action-code" ||
        error.code === "auth/expired-action-code"
      ) {
        console.log(
          `Attempt to use invalidated sign-in link, ask administrator for new link: ${error.message}`,
        ); // link has already been used once or has expired
      }
      // email has already been validated and user shouldn't be disabled, so auth/invalid-email and auth/user-disabled isn't checked
    }
    return null;
  }
};

const loginWithGoogle = async (idToken: string): Promise<AuthenticatedUser> => {
  try {
    const { data } = await baseAPIClient.post(
      "/auth/login",
      { idToken },
      { withCredentials: true },
    );
    localStorage.setItem(AUTHENTICATED_USER_KEY, JSON.stringify(data));
    return data;
  } catch (error) {
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

const resetPassword = async (email: string | undefined): Promise<boolean> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    await baseAPIClient.post(
      `/auth/resetPassword/${email}`,
      {},
      { headers: { Authorization: bearerToken } },
    );
    return true;
  } catch (error) {
    return false;
  }
};

// for testing only, refresh does not need to be exposed in the client
const refresh = async (): Promise<boolean> => {
  try {
    const { data } = await baseAPIClient.post(
      "/auth/refresh",
      {},
      { withCredentials: true },
    );
    setLocalStorageObjProperty(
      AUTHENTICATED_USER_KEY,
      "accessToken",
      data.accessToken,
    );
    return true;
  } catch (error) {
    return false;
  }
};

export default {
  login,
  loginWithSignInLink,
  logout,
  loginWithGoogle,
  register,
  resetPassword,
  refresh,
};
