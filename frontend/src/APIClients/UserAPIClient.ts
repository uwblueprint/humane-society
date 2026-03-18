import axios from "axios";
import { User, CreateUserDTO } from "../types/UserTypes";
import AUTHENTICATED_USER_KEY from "../constants/AuthConstants";
import baseAPIClient from "./BaseAPIClient";
import { getLocalStorageObjProperty } from "../utils/LocalStorageUtils";

async function get(): Promise<User[]>;
async function get(userId: number): Promise<User>;

async function get(userId?: number): Promise<User | User[]> {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;

  try {
    const url = userId ? `/users?userId=${userId}` : "/users";
    const { data } = await baseAPIClient.get(url, {
      headers: { Authorization: bearerToken },
    });

    return data;
  } catch (error) {
    throw new Error(
      `Failed to get user(s). ${
        error instanceof Error ? error.message : "Unknown error occurred."
      }`,
    );
  }
}

const create = async (formData: CreateUserDTO): Promise<User> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    const { data } = await baseAPIClient.post("/users", formData, {
      headers: { Authorization: bearerToken },
    });
    return data;
  } catch (error) {
    throw new Error(`Failed to create user: ${error}`);
  }
};

const update = async (
  userId: number,
  formData: Partial<User>,
): Promise<User> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    const { data } = await baseAPIClient.put(`/users/${userId}`, formData, {
      headers: { Authorization: bearerToken },
    });
    return data;
  } catch (error) {
    throw new Error(`Failed to update user: ${error}`);
  }
};

const invite = async (email: string): Promise<void> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    await baseAPIClient.post(
      "/auth/invite-user",
      { email },
      {
        headers: { Authorization: bearerToken },
      },
    );
  } catch (error) {
    throw new Error(`Failed to invite user with email '${email}'`);
  }
};

const deleteUser = async (userId: string): Promise<void> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  const url = userId ? `/users?userId=${userId}` : "/users";

  try {
    await baseAPIClient.delete(url, {
      headers: { Authorization: bearerToken },
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error(`Failed to delete user '${error}'`);
  }
};

const uploadProfilePhoto = async (
  file: File,
  userId: number,
  oldStoragePath?: string,
): Promise<void> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;

  const url = `/users/me/profile-photo/upload`;

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId.toString());
    if (oldStoragePath) {
      formData.append("oldStoragePath", oldStoragePath);
    }

    await baseAPIClient.post(url, formData, {
      headers: {
        Authorization: bearerToken,
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error) {
    throw new Error(`Failed to upload profile photo: ${error}`);
  }
};
const setDefaultProfilePhoto = async (userId: number): Promise<void> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;

  try {
    const url = `/users/me/profile-photo/default`;
    await baseAPIClient.post(url, null, {
      headers: { Authorization: bearerToken },
      params: { userId },
    });
  } catch (error) {
    throw new Error(`Failed to set default profile photo: ${error}`);
  }
};

const getProfilePhotoUrl = async (userId: number): Promise<string> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;

  try {
    const url = `/users/me/profile-photo`;
    const { data } = await baseAPIClient.get(url, {
      headers: { Authorization: bearerToken },
      params: { userId },
    });
    return data.url;
  } catch (error) {
    throw new Error(`Failed to get profile photo URL: ${error}`);
  }
};

export default {
  get,
  create,
  invite,
  update,
  deleteUser,
  uploadProfilePhoto,
  getProfilePhotoUrl,
  setDefaultProfilePhoto,
};
