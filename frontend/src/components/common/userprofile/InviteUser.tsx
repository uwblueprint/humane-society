import React from "react";

import { Button } from "@chakra-ui/react";
import UserAPIClient from "../../../APIClients/UserAPIClient";

export interface InviteUserProps {
  email: string;
}

const InviteUser = ({ email }: InviteUserProps): React.ReactElement => {
  const onInviteClick = async () => {
    // TODO: Trigger invitation sent modal
    // const success = await UserAPIClient.invite(email);
    await UserAPIClient.invite(email);
  };

  return (
    <Button
      type="button"
      className="btn"
      onClick={onInviteClick}
      width="100%"
      sx={{
        backgroundColor: "blue.700",
        color: "white",
        fontWeight: "normal",
        _active: { backgroundColor: "blue.800" },
        _hover: { color: "white", backgroundColor: "blue.800" },
        _focus: { boxShadow: "0 0 0 .2rem rgba(44, 82, 130, .25)" },
        _focusVisible: { boxShadow: "0 0 0 .2rem rgba(44, 82, 130, .25)" },
      }}
    >
      Resend Invite Email
    </Button>
  );
};

export default InviteUser;
