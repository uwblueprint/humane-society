import { FC } from "react";
import PopupModal from "../../../components/common/PopupModal";
import { useHistory } from "react-router-dom";

interface QuitEditingModalProps {
  isOpen: boolean; // Whether the modal should be visible
  handleSecondaryButtonClick: () => void; // Functionality for secondary button
  navigateTo: string; // path
}

const QuitEditingModal: FC<QuitEditingModalProps> = ({
  isOpen,
  handleSecondaryButtonClick,
  navigateTo,
}) => {
  const history = useHistory();
  const handlePrimaryButtonClick = () => {
    history.push(navigateTo);
  };
  return (
    <PopupModal
      open={isOpen}
      title="Quit Editing?"
      message="Changes you made so far will not be saved."
      primaryButtonText="Leave"
      onPrimaryClick={handlePrimaryButtonClick}
      primaryButtonColor="red"
      secondaryButtonText="Keep Editing"
      onSecondaryClick={handleSecondaryButtonClick}
    />
  );
};

export default QuitEditingModal;
