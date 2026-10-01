import { signInWithEmailLink } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import auth from "../firebase";
import AUTHENTICATED_USER_KEY from "../constants/AuthConstants";
import { AuthenticatedUser, PasswordSetResponse } from "../types/AuthTypes";
import baseAPIClient from "./BaseAPIClient";
import { getLocalStorageObjProperty } from "../utils/LocalStorageUtils";
import { refreshAccessToken } from "../utils/AuthUtils";

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
  return refreshAccessToken();
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

export default {
  login,
  loginWithSignInLink,
  logout,
  register,
  sendPasswordResetEmail,
  refresh,
  setPassword,
  getEmailOfCurrentUser,
};
