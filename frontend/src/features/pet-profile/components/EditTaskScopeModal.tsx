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
  startDateBeforeOccurrence?: boolean;
  startDateChanged?: boolean;
}

const EditTaskScopeModal = ({
  open,
  onCancel,
  onConfirm,
  disableSingle = false,
  disableSeries = false,
  startDateBeforeOccurrence = false,
  startDateChanged = false,
}: EditTaskScopeModalProps): React.ReactElement => {
  const [scope, setScope] = useState("single");
  const seriesDisabled = disableSeries || startDateBeforeOccurrence;

  useEffect(() => {
    if (open) setScope(disableSingle ? "series" : "single");
  }, [open, disableSingle]);

  useEffect(() => {
    if (disableSingle && seriesDisabled) return;
    if (disableSingle && scope === "single") setScope("series");
    if (seriesDisabled && scope === "series") setScope("single");
  }, [disableSingle, seriesDisabled, scope]);

  return (
    <PopupModal
      open={open}
      title="Edit Task"
      primaryButtonText="Confirm"
      onPrimaryClick={() => onConfirm(scope === "single")}
      isPrimaryDisabled={disableSingle && seriesDisabled}
      secondaryButtonText="Cancel"
      onSecondaryClick={onCancel}
    >
      {disableSingle && seriesDisabled && (
        <Flex gap="0.375rem" align="flex-start" width="100%">
          <WarningTwoIcon color="red.600" boxSize="1rem" mt="0.125rem" />
          <Text color="red.600" fontSize="0.875rem" m={0}>
            {disableSeries
              ? `Neither option works here. Cancel, then either undo recurrence changes to edit just this task, or exit and make recurrence edits on a non-past task instead.`
              : `Neither option works here. Cancel, then either undo recurrence changes to edit just this task, or keep the start date on or after this task's original date.`}
          </Text>
        </Flex>
      )}
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
            <Radio
              value="series"
              colorScheme="blue"
              isDisabled={seriesDisabled}
            >
              <Text
                textStyle="body"
                color={seriesDisabled ? "gray.400" : "gray.700"}
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
            {startDateBeforeOccurrence && (
              <Text color="gray.500" fontSize="0.875rem" m={0} ml="1.75rem">
                The start date cannot be moved earlier than this occurrence.
              </Text>
            )}
            {startDateChanged && scope === "series" && !seriesDisabled && (
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
