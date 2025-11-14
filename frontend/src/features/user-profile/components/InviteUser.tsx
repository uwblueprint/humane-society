import React from "react";

import Button from "../../../components/common/Button";
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
      variant="dark-blue"
      width="100%"
      size="medium"
      onClick={onInviteClick}
    >
      Resend Invite Email
    </Button>
  );
};

export default InviteUser;
