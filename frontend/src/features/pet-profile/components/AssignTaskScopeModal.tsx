import React, { useEffect, useState } from "react";
import { Flex, Radio, RadioGroup, Text } from "@chakra-ui/react";
import PopupModal from "../../../components/common/PopupModal";

interface AssignTaskScopeModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (single: boolean) => void;
  disableSeries?: boolean;
}

const AssignTaskScopeModal = ({
  open,
  onCancel,
  onConfirm,
  disableSeries = false,
}: AssignTaskScopeModalProps): React.ReactElement => {
  const [scope, setScope] = useState("single");

  useEffect(() => {
    if (open) setScope("single");
  }, [open]);

  useEffect(() => {
    if (disableSeries && scope === "series") setScope("single");
  }, [disableSeries, scope]);

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
          <Flex direction="column" gap="0.375rem">
            <Radio value="series" colorScheme="blue" isDisabled={disableSeries}>
              <Text
                textStyle="body"
                color={disableSeries ? "gray.400" : "gray.700"}
                m={0}
              >
                This and following tasks
              </Text>
            </Radio>
            {disableSeries && (
              <Text color="gray.500" fontSize="0.875rem" m={0} ml="1.75rem">
                Past occurrences can only be assigned individually.
              </Text>
            )}
          </Flex>
        </Flex>
      </RadioGroup>
    </PopupModal>
  );
};

export default AssignTaskScopeModal;
