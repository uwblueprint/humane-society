import React, { useContext } from "react";

import { Button } from "@chakra-ui/react";
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
    <Button
      type="button"
      className="btn"
      onClick={onLogOutClick}
      width="100%"
      sx={{
        backgroundColor: "red.800",
        color: "white",
        fontWeight: "normal",
        _active: { backgroundColor: "red.900" },
        _hover: { color: "white", backgroundColor: "red.900" },
        _focus: { boxShadow: "0 0 0 .2rem rgba(130, 39, 39, .25)" },
        _focusVisible: { boxShadow: "0 0 0 .2rem rgba(130, 39, 39, .25)" },
      }}
    >
      Log Out
    </Button>
  );
};

export default Logout;
