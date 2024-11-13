import AUTHENTICATED_USER_KEY from "../constants/AuthConstants";
import { AuthenticatedUser, PasswordSetResponse } from "../types/AuthTypes";
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

// // trinity did this VV
const setPassword = async (
  newPassword: string,
): Promise<PasswordSetResponse> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    const email = getLocalStorageObjProperty(AUTHENTICATED_USER_KEY, "email")
    // set password
    const response = await baseAPIClient.post(
      `/auth/setPassword/${email}`,
      { newPassword },
      { headers: { Authorization: bearerToken } },
    );
    const { success, userDTO, errorMessage } = response.data;
    if (success) {
      localStorage.setItem(AUTHENTICATED_USER_KEY, JSON.stringify(userDTO));
    }
    return { success, errorMessage };
  } catch (error) {
    return { success: false, errorMessage: "An unknown error occured." };
  }
};

export default {
  login,
  logout,
  loginWithGoogle,
  register,
  resetPassword,
  refresh,
  setPassword,
};
