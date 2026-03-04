import React, { FC, useContext } from "react";
import { useToast } from "@chakra-ui/react";
import PopupModal from "../../../components/common/PopupModal";
import UserAPIClient from "../../../APIClients/UserAPIClient";
import AuthContext from "../../../contexts/AuthContext";
import AUTHENTICATED_USER_KEY from "../../../constants/AuthConstants";

interface DeleteUserModalProps {
  isOpen: boolean; // Whether the modal should be visible
  handleSecondaryButtonClick: () => void; // Functionality for secondary button
  userId: string; // userID to be deleted
}

const DeleteUserModal: FC<DeleteUserModalProps> = ({
  isOpen,
  handleSecondaryButtonClick,
  userId,
}) => {
  const toast = useToast();
  const { authenticatedUser, setAuthenticatedUser } = useContext(AuthContext);

  const logout = async () => {
    if (authenticatedUser?.id) {
      setAuthenticatedUser(null);
      localStorage.removeItem(AUTHENTICATED_USER_KEY);
    }
  };

  const handlePrimaryButtonClick = async () => {
    if (String(authenticatedUser?.id) === String(userId)) {
      toast({
        title: "Delete User",
        description: "You cannot delete your own account.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await UserAPIClient.deleteUser(userId);
      toast({
        title: "Success",
        description: "Successfully deleted user!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      logout();
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "";
      const description =
        errorMessage.includes("user status must be 'Inactive' or 'Invited'")
          ? "User must be deactivated before deletion. Please change the user's status to 'Inactive' or 'Invited' first."
          : "Unable to delete user, please try again later.";
      toast({
        title: "Delete User",
        description,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  return (
    <PopupModal
      open={isOpen}
      title="Delete User?"
      message="Are you sure you want to delete this user? This process cannot be undone."
      primaryButtonText="Delete"
      onPrimaryClick={handlePrimaryButtonClick}
      primaryButtonColor="red"
      secondaryButtonText="Cancel"
      onSecondaryClick={handleSecondaryButtonClick}
    />
  );
};

export default DeleteUserModal;
