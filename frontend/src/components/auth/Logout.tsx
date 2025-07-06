import React, { useContext } from "react";

import Button from "../common/Button";
import authAPIClient from "../../APIClients/AuthAPIClient";
import AuthContext from "../../contexts/AuthContext";

const Logout = (): React.ReactElement => {
  const { authenticatedUser, setAuthenticatedUser } = useContext(AuthContext);

  const onLogOutClick = async () => {
    const success = await authAPIClient.logout(authenticatedUser?.id);
    if (success) {
      setAuthenticatedUser(null);
    }
  };

  return (
    <Button variant="red" width="100%" size="medium" onClick={onLogOutClick}>
      Log Out
    </Button>
  );
};

export default Logout;
