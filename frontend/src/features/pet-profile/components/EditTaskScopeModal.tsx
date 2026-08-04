import React, { useEffect, useState } from "react";
import { Flex, Radio, RadioGroup, Text } from "@chakra-ui/react";
import { WarningTwoIcon } from "@chakra-ui/icons";
import PopupModal from "../../../components/common/PopupModal";
import { startOfLocalDay } from "../../../utils/taskStatusUtils";

interface EditTaskScopeModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (single: boolean) => void; // true = "This task" only
  disableSingle?: boolean;
  disableSeries?: boolean;
  startDateBeforeOccurrence?: boolean;
  startDateChanged?: boolean;
  // The occurrence the user opened, used to name dates in the warnings
  occurrenceDate?: string;
  // The start date currently entered in the form
  newStartDate?: Date | null;
  // Days, cadence or recurrence end date differ from what was prefilled
  recurrenceChanged?: boolean;
  // The opened occurrence is today and has already been started or completed
  todayHasProgress?: boolean;
}

const formatShortDate = (date: Date): string =>
  date.toLocaleDateString("default", { month: "short", day: "numeric" });

const WarningLine = ({
  message,
  indent = false,
}: {
  message: string;
  indent?: boolean;
}): React.ReactElement => (
  <Flex
    gap="0.375rem"
    align="flex-start"
    width="100%"
    ml={indent ? "1.75rem" : "0"}
  >
    <WarningTwoIcon color="red.600" boxSize="1rem" mt="0.125rem" />
    <Text color="red.600" fontSize="0.875rem" m={0}>
      {message}
    </Text>
  </Flex>
);

const EditTaskScopeModal = ({
  open,
  onCancel,
  onConfirm,
  disableSingle = false,
  disableSeries = false,
  startDateBeforeOccurrence = false,
  startDateChanged = false,
  occurrenceDate,
  newStartDate,
  recurrenceChanged = false,
  todayHasProgress = false,
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

  const occurrenceLabel = occurrenceDate
    ? formatShortDate(new Date(occurrenceDate))
    : null;

  // The stretch of days the old schedule has given up but the new one has not
  // picked up yet, i.e. the start date was pushed later than this occurrence.
  let gapLabel: string | null = null;
  if (occurrenceDate && newStartDate) {
    const gapStart = startOfLocalDay(occurrenceDate);
    const gapEnd = startOfLocalDay(newStartDate);
    gapEnd.setDate(gapEnd.getDate() - 1);
    if (gapEnd >= gapStart) {
      gapLabel =
        gapEnd.getTime() === gapStart.getTime()
          ? formatShortDate(gapStart)
          : `${formatShortDate(gapStart)}–${formatShortDate(gapEnd)}`;
    }
  }

  const seriesSelectable = scope === "series" && !seriesDisabled;

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
        <WarningLine
          message={
            disableSeries
              ? `Neither option works here. Cancel, then either undo the recurrence changes to edit just this task, or make recurrence edits from a task that isn't in the past.`
              : `Neither option works here. Cancel, then either undo recurrence changes to edit just this task, or keep the start date on or after this task's original date.`
          }
        />
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
                {`You're editing from the middle of the series, so following tasks can only start on or after ${
                  occurrenceLabel ?? "this task's date"
                }. To start the schedule earlier, cancel and edit from the series' first task instead.`}
              </Text>
            )}
            {seriesSelectable && recurrenceChanged && (
              <WarningLine
                indent
                message="Days that get removed due to this change will no longer be scheduled. Tasks individually assigned to users on those days will be deleted."
              />
            )}
            {seriesSelectable && startDateChanged && (
              <WarningLine
                indent
                message={
                  gapLabel && newStartDate
                    ? `Future tasks will repeat from ${formatShortDate(
                        newStartDate,
                      )}. ${gapLabel} will no longer be scheduled, and tasks individually assigned to users on those days will be deleted.`
                    : `All future tasks will now repeat from this new start date.`
                }
              />
            )}
            {seriesSelectable &&
              todayHasProgress &&
              (recurrenceChanged || startDateChanged) && (
                <WarningLine
                  indent
                  message="Today's task has already been started. If today isn't in the schedule you've changed to, it will be removed along with the record of the work already done today for this task."
                />
              )}
          </Flex>
        </Flex>
      </RadioGroup>
    </PopupModal>
  );
};

export default EditTaskScopeModal;
