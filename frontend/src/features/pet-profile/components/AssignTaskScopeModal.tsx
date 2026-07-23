import React, { useEffect, useState } from "react";
import { Flex, Radio, RadioGroup, Text } from "@chakra-ui/react";
import PopupModal from "../../../components/common/PopupModal";

interface AssignTaskScopeModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (single: boolean) => void;
}

const AssignTaskScopeModal = ({
  open,
  onCancel,
  onConfirm,
}: AssignTaskScopeModalProps): React.ReactElement => {
  const [scope, setScope] = useState("single");

  useEffect(() => {
    if (open) setScope("single");
  }, [open]);

  return (
    <PopupModal
      open={open}
      title="Assign Task"
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
              This and recurring tasks
            </Text>
          </Radio>
        </Flex>
      </RadioGroup>
    </PopupModal>
  );
};

export default AssignTaskScopeModal;
