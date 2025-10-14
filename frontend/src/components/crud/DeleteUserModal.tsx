import React, { FC, useContext } from "react";
import PopupModal from "../common/PopupModal";
import UserAPIClient from "../../APIClients/UserAPIClient";
import { useToast } from "@chakra-ui/react";
import AuthContext from "../../contexts/AuthContext";
import AUTHENTICATED_USER_KEY from "../../constants/AuthConstants";

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
      toast({
        title: "Delete User",
        description: "Unable to delete user, please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  return (
    <PopupModal
      open={isOpen}
      title={"Delete User?"}
      message={
        "Are you sure you want to delete this user? This process cannot be undone."
      }
      primaryButtonText={"Delete"}
      onPrimaryClick={handlePrimaryButtonClick}
      primaryButtonColor={"red"}
      secondaryButtonText={"Cancel"}
      onSecondaryClick={handleSecondaryButtonClick}
    />
  );
};

export default DeleteUserModal;
