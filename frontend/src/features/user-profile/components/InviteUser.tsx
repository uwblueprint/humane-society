import React, { useState } from "react";

import Button from "../../../components/common/Button";
import PopupModal from "../../../components/common/PopupModal";
import UserAPIClient from "../../../APIClients/UserAPIClient";

export interface InviteUserProps {
  email: string;
}

const InviteUser = ({ email }: InviteUserProps): React.ReactElement => {
  const [isInviteSentOpen, setIsInviteSentOpen] = useState(false);
  const onInviteClick = async () => {
    await UserAPIClient.invite(email);
    setIsInviteSentOpen(true);
  };

  return (
    <>
      <Button
        variant="dark-blue"
        width="100%"
        size="medium"
        onClick={onInviteClick}
      >
        Resend Verification Email
      </Button>
      <PopupModal
        open={isInviteSentOpen}
        title="Invitation Sent!"
        message="An invitation link has been successfully sent to the user's email."
        primaryButtonText="Back to User Profile"
        onPrimaryClick={() => setIsInviteSentOpen(false)}
      />
    </>
  );
};

export default InviteUser;
