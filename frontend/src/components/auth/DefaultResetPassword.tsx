import React, { useContext } from "react";
import authAPIClient from "../../APIClients/AuthAPIClient";
import AuthContext from "../../contexts/AuthContext";

/* Note: only used for Default.tsx page for testing */
const DefaultResetPassword = (): React.ReactElement => {
  const { authenticatedUser } = useContext(AuthContext);

  const onResetPasswordClick = async () => {
    await authAPIClient.sendPasswordResetEmail(authenticatedUser?.email);
  };

  return (
    <button
      type="button"
      className="btn btn-primary"
      onClick={onResetPasswordClick}
    >
      Reset Password
    </button>
  );
};

export default DefaultResetPassword;
