import React, { FC } from "react";
import PopupModal from "../../../components/common/PopupModal";

interface AddPetModalProps {
  isOpen: boolean; // Whether the modal should be visible
  handlePrimaryButtonClick: () => void; // Functionalituy for the first button
  handleSecondaryButtonClick: () => void; // Functionality for secondary button
  isLoading?: boolean; // Whether the primary button should show a loading state
}

const AddPetModal: FC<AddPetModalProps> = ({
  isOpen,
  handlePrimaryButtonClick,
  handleSecondaryButtonClick,
  isLoading = false,
}) => {
  return (
    <PopupModal
      open={isOpen}
      title="Add Pet?"
      message="Are you sure you want to add this pet? A verification link will be sent to them."
      primaryButtonText="Add"
      primaryButtonColor="red"
      onPrimaryClick={handlePrimaryButtonClick}
      secondaryButtonText="Cancel"
      onSecondaryClick={handleSecondaryButtonClick}
      isPrimaryLoading={isLoading}
    />
  );
};

export default AddPetModal;
