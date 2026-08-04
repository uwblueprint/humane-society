import React, { useEffect, useState } from "react";
import { Flex, Radio, RadioGroup, Text } from "@chakra-ui/react";
import PopupModal from "../../../components/common/PopupModal";

interface EditTaskScopeModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (single: boolean) => void; // true = "This task" only
}

const EditTaskScopeModal = ({
  open,
  onCancel,
  onConfirm,
}: EditTaskScopeModalProps): React.ReactElement => {
  const [scope, setScope] = useState("single");

  useEffect(() => {
    if (open) setScope("single");
  }, [open]);

  return (
    <PopupModal
      open={open}
      title="Edit Task"
      primaryButtonText="Confirm"
      onPrimaryClick={() => onConfirm(scope === "single")}
      secondaryButtonText="Cancel"
      onSecondaryClick={onCancel}
    >
      <RadioGroup value={scope} onChange={setScope} width="100%">
        <Flex direction="column" gap="1rem" align="flex-start">
          <Radio value="single" colorScheme="blue">
            <Text textStyle="body" color="gray.700" m={0}>
              This task
            </Text>
          </Radio>
          <Radio value="series" colorScheme="blue">
            <Text textStyle="body" color="gray.700" m={0}>
              This and following tasks
            </Text>
          </Radio>
        </Flex>
      </RadioGroup>
    </PopupModal>
  );
};

export default EditTaskScopeModal;
