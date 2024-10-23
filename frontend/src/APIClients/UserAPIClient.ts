import axios from "axios";
import { User } from "../types/UserTypes";
import { getLocalStorageObj } from "../utils/LocalStorageUtils";
import AUTHENTICATED_USER_KEY from "../constants/AuthConstants";

const baseURL = process.env.REACT_APP_BACKEND_URL;

const get = async (): Promise<User[]> => {
  try {
    const currentUser: { accessToken?: string } =
      getLocalStorageObj(AUTHENTICATED_USER_KEY) || {};
    const accessToken = currentUser?.accessToken;

    const { data } = await axios.get(`${baseURL}/users`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    });

    return data;
  } catch (error) {
    throw new Error(`Failed to get users: ${error}`);
  }
};

export default { get };
