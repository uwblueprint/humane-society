import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Text,
  Checkbox,
  Box,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Select,
} from "@chakra-ui/react";
import React from "react";
import {
  Control,
  Controller,
  UseFormWatch,
  UseFormGetValues,
  useFormState,
  UseFormTrigger,
} from "react-hook-form";
import Input from "../../../../components/common/Input";
import TaskCategoryBadge from "../../../../components/common/TaskCategoryBadge";
import { TaskCategory } from "../../../../types/TaskTypes";
import { AddTaskFormData } from "./AddTaskFormTypes";
import SingleSelect from "../../../../components/common/SingleSelect";
import TextArea from "../../../../components/common/TextArea";
import { MONTH_NAME_TO_NUMBER } from "../../../../utils/CommonUtils";
import { getDaysInMonth } from "../../../../utils/CommonUtils";

interface AddTaskForm2Props {
  control: Control<AddTaskFormData>;
  watch: UseFormWatch<AddTaskFormData>;
  getValues: UseFormGetValues<AddTaskFormData>;
  trigger: UseFormTrigger<AddTaskFormData>;
}

// TODO: make this work lol !
function isLeapYear(year: number): boolean {
  if (year % 100 === 0 && year % 400 !== 0) {
    return false;
  } else if (year % 4 === 0) {
    return true;
  } else {
    return false;
  }
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const HOURS = [
  "00",
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
];
const MINUTES = ["00", "15", "30", "45"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FREQUENCY = ["Weekly", "Biweekly", "Monthly", "Annually"];
const YEARS: string[] = [];
const today = new Date();
for (let i = 0; i < 5; i++) {
  YEARS.push(String(today.getFullYear() + i));
}

function toMinute(hour: string, minute: string): number {
  return Number(hour) * 60 + Number(minute);
}

function toDate(month: string, day: string, year: string): Date {
  const m = MONTH_NAME_TO_NUMBER[month];
  return new Date(Number(year), m - 1, Number(day));
}

const AddTaskForm2 = ({
  control,
  watch,
  getValues,
  trigger,
}: AddTaskForm2Props): React.ReactElement => {
  const { errors } = useFormState({ control });
  const isRepeating = watch("isRepeating");
  const startMonth = watch("startMonth");
  const startYear = watch("startYear");
  const endMonth = watch("endMonth");
  const endYear = watch("endYear");

  const startDays = Array.from(
    { length: getDaysInMonth(startMonth, Number(startYear)) },
    (_, i) => String(i + 1),
  );
  const endDays = Array.from(
    { length: getDaysInMonth(endMonth, Number(endYear)) },
    (_, i) => String(i + 1),
  );

  const taskCategory = watch("taskCategory");

  // error trackers
  const startDateError = !!(
    errors.startMonth ||
    errors.startDay ||
    errors.startYear
  );
  const endTimeError = !!(
    errors.startHour ||
    errors.startMinute ||
    errors.endHour ||
    errors.endMinute
  );
  const endDateError = !!(errors.endMonth || errors.endDay || errors.endYear);

  return (
    <Flex flexDirection="column" gap="1.5rem" width="100%">
      {/* Task Name */}
      <FormControl>
        <FormLabel
          color="gray.600"
          marginBottom="0.38rem"
          fontWeight="normal"
          m={0}
        >
          Task Name:
        </FormLabel>
        <Controller
          control={control}
          name="taskName"
          render={({ field }) => <Input value={field.value} disabled />}
        />
      </FormControl>

      {/* Task Category */}
      <FormControl>
        <FormLabel
          color="gray.600"
          marginBottom="0.38rem"
          fontWeight="normal"
          m={0}
        >
          Task Category:
        </FormLabel>
        {taskCategory && (
          <TaskCategoryBadge
            taskCategory={taskCategory as TaskCategory}
            iconSize="2rem"
          />
        )}
      </FormControl>

      {/* Instructions */}
      <FormControl isRequired>
        <FormLabel
          color="gray.600"
          marginBottom="0.38rem"
          fontWeight="normal"
          m={0}
        >
          Instructions:
        </FormLabel>
        <Controller
          control={control}
          name="instructions"
          rules={{
            required: "Please fill out instructions.",
            validate: {
              maxWords: (value: string) => {
                const wordCount = value.trim().split(/\s+/).length;
                return (
                  wordCount <= 10000 ||
                  "Information must not exceed 10,000 words."
                );
              },
            },
          }}
          render={({ field, fieldState: { error } }) => (
            <Flex flexDirection="column" gap="0.375rem">
              <TextArea
                value={field.value}
                onChange={field.onChange}
                required={true}
                placeholder="Enter instructions"
                style={{ borderColor: error ? "red" : undefined }}
              />
              {error && (
                <Text color="red.400" fontSize="1rem" m={0}>
                  {error.message}
                </Text>
              )}
            </Flex>
          )}
        />
      </FormControl>

      {/* Start Date */}
      <Flex flexDirection="column" gap="0.375rem">
        <FormControl isRequired>
          <FormLabel
            color="gray.600"
            marginBottom="0.38rem"
            fontWeight="normal"
            m={0}
          >
            Start Date:
          </FormLabel>
          <Flex gap="0.75rem">
            {/* Month */}
            <Flex flex="2">
              <Controller
                control={control}
                name="startMonth"
                rules={{
                  required: true,
                }}
                render={({ field, fieldState: { error } }) => (
                  <SingleSelect
                    values={MONTHS}
                    selected={field.value}
                    onSelect={(val) => {
                      field.onChange(val);
                      trigger("startDay");
                    }}
                    placeholder="Enter month"
                    error={!!error || startDateError}
                  />
                )}
              />
            </Flex>
            {/* Day */}
            <Flex flex="1">
              <Controller
                control={control}
                name="startDay"
                rules={{
                  required: true,
                  validate: {
                    isValid: (day) => {
                      const { startMonth: month, startYear: year } =
                        getValues();
                      if (!month || !year) return false;
                      const selected = toDate(month, day, year);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return (
                        selected >= today ||
                        `Date must be after ${today.toLocaleDateString(
                          "en-CA",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}`
                      );
                    },
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <Flex flexDirection="column" gap="0.25rem" width="100%">
                    <SingleSelect
                      values={startDays}
                      selected={field.value}
                      onSelect={field.onChange}
                      placeholder="Enter date"
                      error={!!error || startDateError}
                    />
                  </Flex>
                )}
              />
            </Flex>
            {/* Year*/}
            <Flex flex="1">
              <Controller
                control={control}
                name="startYear"
                rules={{ required: true }}
                render={({ field, fieldState: { error } }) => (
                  <SingleSelect
                    values={YEARS}
                    selected={field.value}
                    onSelect={(val) => {
                      field.onChange(val);
                      trigger("startDay");
                    }}
                    placeholder="Enter year"
                    error={!!error || startDateError}
                  />
                )}
              />
            </Flex>
          </Flex>
        </FormControl>
        {(errors.startMonth || errors.startDay || errors.startYear) && (
          <Text color="red.400" fontSize="1rem" m={0}>
            {errors.startMonth?.message ||
              errors.startDay?.message ||
              errors.startYear?.message}
          </Text>
        )}
      </Flex>

      {/* Scheduled Start and End Times */}
      <Flex gap="1.5rem">
        {/* Scheduled Start Time */}
        <Flex flexDirection="column" gap="0.375rem" flex="1">
          <FormControl isRequired>
            <FormLabel
              color="gray.600"
              marginBottom="0.38rem"
              fontWeight="normal"
              m={0}
            >
              Scheduled Start Time:
            </FormLabel>
            <Flex gap="0.75rem">
              {/* Start Hour */}
              <Flex flex="1" minWidth="20rem">
                <Controller
                  control={control}
                  name="startHour"
                  rules={{ required: "Please fill out start time." }}
                  render={({ field, fieldState: { error } }) => (
                    <SingleSelect
                      values={HOURS}
                      selected={field.value}
                      onSelect={(val) => {
                        field.onChange(val);
                        trigger("endHour");
                      }}
                      placeholder="Enter hour"
                      error={!!error || endTimeError}
                    />
                  )}
                />
              </Flex>
              <Text m={0} alignSelf="center">
                :
              </Text>
              {/* Start Minute */}
              <Flex flex="1">
                <Controller
                  control={control}
                  name="startMinute"
                  rules={{ required: "Please fill out start time." }}
                  render={({ field, fieldState: { error } }) => (
                    <SingleSelect
                      values={MINUTES}
                      selected={field.value}
                      onSelect={(val) => {
                        field.onChange(val);
                        trigger("endHour");
                      }}
                      placeholder="Enter minute"
                      error={!!error || endTimeError}
                    />
                  )}
                />
              </Flex>
            </Flex>
          </FormControl>
          {(errors.startHour ||
            errors.startMinute ||
            errors.endHour ||
            errors.endMinute) && (
            <Text color="red.400" fontSize="1rem" m={0}>
              {errors.startHour?.message ||
                errors.startMinute?.message ||
                errors.endHour?.message ||
                errors.endMinute?.message}
            </Text>
          )}
        </Flex>

        {/* Scheduled End Time */}
        <Flex flexDirection="column" gap="0.375rem" flex="1">
          <FormControl isRequired>
            <FormLabel
              color="gray.600"
              marginBottom="0.38rem"
              fontWeight="normal"
              m={0}
            >
              Scheduled End Time:
            </FormLabel>
            <Flex gap="0.75rem">
              {/* End Hour */}
              <Flex flex="1">
                <Controller
                  control={control}
                  name="endHour"
                  rules={{
                    required: true,
                    validate: {
                      isValid: (endHour) => {
                        const { startHour, startMinute, endMinute } =
                          getValues();
                        if (!startHour || !startMinute || !endMinute)
                          return true;
                        else
                          return (
                            toMinute(endHour, endMinute) >
                              toMinute(startHour, startMinute) ||
                            "End time cannot precede start time."
                          );
                      },
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <SingleSelect
                      values={HOURS}
                      selected={field.value}
                      onSelect={field.onChange}
                      placeholder="Enter hour"
                      error={!!error || endTimeError}
                    />
                  )}
                />
              </Flex>
              <Text m={0} alignSelf="center">
                :
              </Text>
              {/* End Minute */}
              <Flex flex="1">
                <Controller
                  control={control}
                  name="endMinute"
                  rules={{
                    required: true,
                    validate: {
                      isValid: (endMinute) => {
                        const { startHour, startMinute, endHour } = getValues();
                        if (!startHour || !startMinute || !endMinute)
                          return true;
                        else
                          return (
                            toMinute(endHour, endMinute) >
                              toMinute(startHour, startMinute) ||
                            "End time cannot precede start time."
                          );
                      },
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <SingleSelect
                      values={MINUTES}
                      selected={field.value}
                      onSelect={(val) => {
                        field.onChange(val);
                        trigger("endHour");
                      }}
                      placeholder="Enter minute"
                      error={!!error || endTimeError}
                    />
                  )}
                />
              </Flex>
            </Flex>
          </FormControl>
        </Flex>
      </Flex>

      {/* Repeated Task Checkbox */}
      <Controller
        control={control}
        name="isRepeating"
        render={({ field }) => (
          <Checkbox
            isChecked={field.value}
            onChange={field.onChange}
            size="lg"
            _checked={{
              "& .chakra-checkbox__control": {
                background: "blue.700",
                borderColor: "blue.700",
              },
            }}
          >
            Repeating Task
          </Checkbox>
        )}
      />

      {/* If Repeating is Checked */}
      {isRepeating && (
        <Flex flexDirection="column" gap="1.5rem">
          {/* Recurring Days */}
          <FormControl isRequired>
            <Controller
              control={control}
              name="recurringDays"
              rules={{
                validate: {
                  isValid: (days) =>
                    days.length > 0 || "Please select an option.",
                },
              }}
              render={({ field, fieldState: { error } }) => (
                <Flex flexDirection="column" gap="0.38rem">
                  <FormLabel
                    color="gray.600"
                    marginBottom="0.38rem"
                    fontWeight="normal"
                    m={0}
                  >
                    Recurring Days:
                  </FormLabel>
                  <Flex gap="4.5rem" justifyContent="space-between">
                    {DAYS.map((day) => {
                      const isSelected = field.value?.includes(day);
                      return (
                        <Flex
                          key={day}
                          as="button"
                          type="button"
                          flex="1"
                          justifyContent="center"
                          onClick={() => {
                            const updated = isSelected
                              ? field.value.filter((d) => d !== day)
                              : [...(field.value ?? []), day];
                            field.onChange(updated);
                          }}
                          paddingX="3rem"
                          paddingY="0.375rem"
                          borderRadius="0.375rem"
                          border="1px solid"
                          borderColor={isSelected ? "blue.700" : "gray.200"}
                          backgroundColor={isSelected ? "blue.700" : "gray.200"}
                          cursor="pointer"
                        >
                          <Text
                            textStyle="body"
                            color={isSelected ? "white" : "gray.700"}
                            m={0}
                          >
                            {day}
                          </Text>
                        </Flex>
                      );
                    })}
                  </Flex>
                  {error && (
                    <Text color="red.400" fontSize="1rem" m={0}>
                      {error.message}
                    </Text>
                  )}
                </Flex>
              )}
            />
          </FormControl>

          {/* Recurring Cadences */}
          <Flex flexDirection="column" gap="0.375rem">
            <FormControl isRequired>
              <FormLabel
                color="gray.600"
                marginBottom="0.38rem"
                fontWeight="normal"
                m={0}
              >
                Recurring Cadences:
              </FormLabel>
              <Controller
                control={control}
                name="recurringCadences"
                rules={{
                  required: "Please select an option from the dropdown.",
                }}
                render={({ field, fieldState: { error } }) => (
                  <Flex flexDirection="column" gap="0.375rem">
                    <SingleSelect
                      values={FREQUENCY}
                      selected={field.value}
                      onSelect={field.onChange}
                      placeholder="Click for options"
                      error={!!error}
                      required
                    />
                    {error && (
                      <Text color="red.400" fontSize="1rem" m={0}>
                        {error.message}
                      </Text>
                    )}
                  </Flex>
                )}
              />
            </FormControl>
          </Flex>

          {/* End Date */}
          <Flex flexDirection="column" gap="0.375rem">
            <FormLabel
              color="gray.600"
              marginBottom="0.38rem"
              fontWeight="normal"
              m={0}
            >
              End Date:
            </FormLabel>
            <Flex gap="0.75rem">
              {/* Month */}
              <Flex flex="2">
                <Controller
                  control={control}
                  name="endMonth"
                  render={({ field, fieldState: { error } }) => (
                    <SingleSelect
                      values={MONTHS}
                      selected={field.value}
                      onSelect={(val) => {
                        field.onChange(val);
                        trigger("endDay");
                      }}
                      placeholder="Enter month"
                      error={!!error || endDateError}
                    />
                  )}
                />
              </Flex>
              {/* Day */}
              <Flex flex="1">
                <Controller
                  control={control}
                  name="endDay"
                  rules={{
                    validate: {
                      isValid: (endDay) => {
                        const {
                          endMonth,
                          endYear,
                          startDay,
                          startMonth,
                          startYear,
                        } = getValues();
                        if (!endDay || !endMonth || !endYear) return true;
                        const end = toDate(endMonth, endDay, endYear);
                        const start = toDate(startMonth, startDay, startYear);
                        return (
                          end > start || "End date cannot precede start date."
                        );
                      },
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <Flex flexDirection="column" gap="0.25rem" width="100%">
                      <SingleSelect
                        values={endDays}
                        selected={field.value}
                        onSelect={field.onChange}
                        placeholder="Enter date"
                        error={!!error || endDateError}
                      />
                    </Flex>
                  )}
                />
              </Flex>
              {/* Year*/}
              <Flex flex="1">
                <Controller
                  control={control}
                  name="endYear"
                  render={({ field, fieldState: { error } }) => (
                    <SingleSelect
                      values={YEARS}
                      selected={field.value}
                      onSelect={(val) => {
                        field.onChange(val);
                        trigger("endDay");
                      }}
                      placeholder="Enter year"
                      error={!!error || endDateError}
                    />
                  )}
                />
              </Flex>
            </Flex>
            {(errors.endMonth || errors.endDay || errors.endYear) && (
              <Text m={0} color="red.400" fontSize="1rem">
                {errors.endMonth?.message ||
                  errors.endDay?.message ||
                  errors.endYear?.message}
              </Text>
            )}
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};

export default AddTaskForm2;
