import { User, CreateUserDTO } from "../types/UserTypes";
import { Task } from "../types/TaskTypes";
import AUTHENTICATED_USER_KEY from "../constants/AuthConstants";
import baseAPIClient from "./BaseAPIClient";
import { getLocalStorageObjProperty } from "../utils/LocalStorageUtils";

async function get(): Promise<User[]>; // by calling get, we're promising a user array in return
async function get(userId: number): Promise<User>;

// given an optional user Id number, we grab an user (if there is an id), or all users (no user id)
async function get(userId?: number): Promise<User | User[]> {
  // checks whether user has access
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;

  // give user id and grab data that is returned by endpoint
  try {
    // if userId is passed in, use the first part, if not, use the later part.
    const url = userId ? `/users?userId=${userId}` : "/users";
    const { data } = await baseAPIClient.get(url, {
      headers: { Authorization: bearerToken },
    });

    return data;
    // error handling
  } catch (error) {
    throw new Error(
      `Failed to get user(s). ${
        error instanceof Error ? error.message : "Unknown error occurred."
      }`,
    );
  }
}

// create a new user by grabbing information given by CreateUserDTO
const create = async (formData: CreateUserDTO): Promise<CreateUserDTO> => {
  // check authorization, if so, then post (create) the user
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

// Given an email, go go through the route /auth/invite-user and send email
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

const getUserTasks = async (userId: number): Promise<Task[]> => {
  // authorization 
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY, 
    "accesstoken", 
  )}`;

  try {
    const url = `/activity/user/${userId}`; // wrong endpoint?
    const { data } = await baseAPIClient.get(url, {
      headers: { Authorization: bearerToken },
    },);

    return data;
  } catch (error) {
    throw new Error(`Failed to grab user's tasks: ${error}`)
  }
}

export default { get, create, invite, getUserTasks };
