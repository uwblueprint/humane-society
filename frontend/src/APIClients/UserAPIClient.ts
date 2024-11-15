import { User, CreateUserDTO } from "../types/UserTypes";
import AUTHENTICATED_USER_KEY from "../constants/AuthConstants";
import baseAPIClient from "./BaseAPIClient";
import { getLocalStorageObjProperty } from "../utils/LocalStorageUtils";

const get = async (): Promise<User[]> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    const { data } = await baseAPIClient.get("/users", {
      headers: { Authorization: bearerToken },
    });
    return data;
  } catch (error) {
    throw new Error(`Failed to get entity: ${error}`);
  }
};

const create = async (formData: CreateUserDTO): Promise<CreateUserDTO> => {
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

export default { get, create };
