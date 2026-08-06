import React, { FC, useContext } from "react";
import { useToast } from "@chakra-ui/react";
import PopupModal from "../../../components/common/PopupModal";
import TaskTemplateAPIClient from "../../../APIClients/TaskTemplateAPIClient";
import AuthContext from "../../../contexts/AuthContext";

interface DeleteTaskTemplateModalProps {
  taskTemplateId: number;
  taskTemplateName: string;
  isOpen: boolean;
  onClose: () => void;
  onDeleteSuccess?: () => void;
}

const DeleteTaskTemplateModal: FC<DeleteTaskTemplateModalProps> = ({
  taskTemplateId,
  taskTemplateName,
  isOpen,
  onClose,
  onDeleteSuccess,
}) => {
  const toast = useToast();
  const { authenticatedUser } = useContext(AuthContext);

  const handlePrimaryButtonClick = async () => {
    try {
      await TaskTemplateAPIClient.deleteTaskTemplate(taskTemplateId, {
        actorId: authenticatedUser!.id,
        targetId: taskTemplateId,
        taskTemplateName,
      });
      toast({
        title: "Success",
        description: "Task template deleted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onDeleteSuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task template. Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <PopupModal
      open={isOpen}
      title="Delete Template?"
      message="Are you sure you want to delete this template? Tasks can no longer be created with this template. This process cannot be undone."
      primaryButtonText="Delete"
      onPrimaryClick={handlePrimaryButtonClick}
      primaryButtonColor="red"
      secondaryButtonText="Cancel"
      onSecondaryClick={onClose}
    />
  );
};

export default DeleteTaskTemplateModal;
