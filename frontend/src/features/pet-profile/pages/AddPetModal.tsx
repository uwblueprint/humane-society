import React, { FC } from "react";
import PopupModal from "../../../components/common/PopupModal";

interface AddPetModalProps {
  isOpen: boolean; // Whether the modal should be visible
  handlePrimaryButtonClick: () => void; // Handler for the confirm button
  handleSecondaryButtonClick: () => void; // Handler for cancel
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
      title="Add pet?"
      message="Create this pet profile now? You can edit details later from the pet profile page."
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
