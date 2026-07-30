import React, { useEffect, useState } from "react";
import { Flex, Radio, RadioGroup, Text } from "@chakra-ui/react";
import { WarningTwoIcon } from "@chakra-ui/icons";
import PopupModal from "../../../components/common/PopupModal";

interface EditTaskScopeModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (single: boolean) => void; // true = "This task" only
  disableSingle?: boolean;
  disableSeries?: boolean;
  startDateChanged?: boolean;
}

const EditTaskScopeModal = ({
  open,
  onCancel,
  onConfirm,
  disableSingle = false,
  disableSeries = false,
  startDateChanged = false,
}: EditTaskScopeModalProps): React.ReactElement => {
  const [scope, setScope] = useState("single");

  useEffect(() => {
    if (open) setScope(disableSingle ? "series" : "single");
  }, [open, disableSingle]);

  useEffect(() => {
    // If both are disabled at once (e.g. editing a past occurrence with
    // pattern fields also changed), there's no valid option to correct to
    // — leave scope where it is rather than ping-ponging between the two
    // forever.
    if (disableSingle && disableSeries) return;
    if (disableSingle && scope === "single") setScope("series");
    if (disableSeries && scope === "series") setScope("single");
  }, [disableSingle, disableSeries, scope]);

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
          <Flex direction="column" gap="0.375rem">
            <Radio value="single" colorScheme="blue" isDisabled={disableSingle}>
              <Text
                textStyle="body"
                color={disableSingle ? "gray.400" : "gray.700"}
                m={0}
              >
                This task
              </Text>
            </Radio>
            {disableSingle && (
              <Text color="gray.500" fontSize="0.875rem" m={0} ml="1.75rem">
                Cadence, days, or end date changes apply to the whole series.
              </Text>
            )}
          </Flex>
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
                Past occurrences can only be edited individually.
              </Text>
            )}
            {startDateChanged && scope === "series" && (
              <Flex gap="0.375rem" align="center" ml="1.75rem">
                <WarningTwoIcon color="red.600" boxSize="1rem" />
                <Text color="red.600" fontSize="0.875rem" m={0}>
                  All future tasks will now repeat from this new start date.
                </Text>
              </Flex>
            )}
          </Flex>
        </Flex>
      </RadioGroup>
    </PopupModal>
  );
};

export default EditTaskScopeModal;
