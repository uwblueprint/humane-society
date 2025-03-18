import AUTHENTICATED_USER_KEY from "../constants/AuthConstants";
import { AuthenticatedUser } from "../types/AuthTypes";
import { getLocalStorageObj } from "./LocalStorageUtils";

const getCurrentUserRole = (): string | null => {
  const currentUser = getLocalStorageObj<AuthenticatedUser>(
    AUTHENTICATED_USER_KEY,
  );
  return currentUser?.role || null;
};

export default getCurrentUserRole;