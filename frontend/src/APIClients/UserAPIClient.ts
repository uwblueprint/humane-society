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

export default { get, create, update, invite };
