import { User, CreateUserDTO } from "../types/UserTypes";
import AUTHENTICATED_USER_KEY from "../constants/AuthConstants";
import baseAPIClient from "./BaseAPIClient";
import { getLocalStorageObjProperty } from "../utils/LocalStorageUtils";

const getAuthHeader = () => ({
  Authorization: `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`,
});

async function get(): Promise<User[]>;
async function get(userId: number): Promise<User>;

async function get(userId?: number): Promise<User | User[]> {
  try {
    const url = userId ? `/users?userId=${userId}` : "/users";
    const { data } = await baseAPIClient.get(url, {
      headers: getAuthHeader(),
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

const create = async ({
  formData,
}: {
  formData: CreateUserDTO;
}): Promise<CreateUserDTO> => {
  try {
    const { data } = await baseAPIClient.post("/users", formData, {
      headers: getAuthHeader(),
    });
    return data;
  } catch (error) {
    throw new Error(`Failed to create user: ${error}`);
  }
};

const invite = async (email: string): Promise<void> => {
  try {
    await baseAPIClient.post(
      "/auth/invite-user",
      { email },
      {
        headers: getAuthHeader(),
      },
    );
  } catch (error) {
    throw new Error(`Failed to invite user with email '${email}'`);
  }
};

export default { get, create, invite };
