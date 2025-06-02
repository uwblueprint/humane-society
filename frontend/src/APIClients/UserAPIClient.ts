import { User, CreateUserDTO } from "../types/UserTypes"; // /*grab user */
import AUTHENTICATED_USER_KEY from "../constants/AuthConstants"; // *understand role/permissions of user?*/
import baseAPIClient from "./BaseAPIClient"; // gets an access code  
import { getLocalStorageObjProperty } from "../utils/LocalStorageUtils";

// how the function can be used 
async function get(): Promise<User[]>; // if given no parameters, it will return an array of all users 
async function get(userId: number): Promise<User>; // if given the parameter, it promises on the specific user 

// actual function defintion of grabbing user 
async function get(userId?: number): Promise<User | User[]> { // userid? denotes that it's optional, with User OR user[] because it could return either 
  const bearerToken = `Bearer ${getLocalStorageObjProperty( // save the bearer token somewhere to check permissions and authorization 
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;

  try {
    const url = userId ? `/users?userId=${userId}` : "/users"; // : is used almost as or -- if there's a user id, return the user, if not, return all users, creates a route
    const { data } = await baseAPIClient.get(url, { // in a const called data, get request from api 
      headers: { Authorization: bearerToken }, // make sure the user is authorized to see this user??
    });

    return data; 
  } catch (error) { // if they can't process the request, error = true, therefore: 
    throw new Error(
      `Failed to get user(s). ${ // produce error message
        error instanceof Error ? error.message : "Unknown error occurred."
      }`,
    );
  }
}


// this is another function called create, where, when called, will create a user 
const create = async (formData: CreateUserDTO): Promise<CreateUserDTO> => { // create is a function, where the form data is of type createuserDTO, which will promise an object of create user dto
  const bearerToken = `Bearer ${getLocalStorageObjProperty( // grab user perms
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    const { data } = await baseAPIClient.post("/users", formData, { // given data, call for all users 
      headers: { Authorization: bearerToken }, // header contains information that ensures that the user has the correct permissiosn  
    });
    return data; 
  } catch (error) { 
    throw new Error(`Failed to create user: ${error}`);
  }
};

const invite = async (email: string): Promise<void> => { // function called invite which MUST TAKE AN EMAIL 
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    await baseAPIClient.post( // post is CREATE 
      "/auth/invite-user", // send a request to this path that will create a user 
      { email }, // body
      {
        headers: { Authorization: bearerToken },
      },
    );
  } catch (error) { 
    throw new Error(`Failed to invite user with email '${email}'`);
  }
};

export default { get, create, invite }; // export those functions 
