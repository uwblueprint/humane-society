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
  Textarea,
} from "@chakra-ui/react";
import React from "react";
import { Control, Controller, UseFormWatch } from "react-hook-form";
import Input from "../../../../components/common/Input";
import TaskCategoryBadge from "../../../../components/common/TaskCategoryBadge";
import { TaskCategory } from "../../../../types/TaskTypes";
import { AddTaskFormData } from "./AddTaskFormTypes";
import SingleSelect from "../../../../components/common/SingleSelect";
import MultiSelect from "../../../../components/common/MultiSelect";
import TextArea from "../../../../components/common/TextArea";

interface AddTaskForm2Props {
  control: Control<AddTaskFormData>;
  watch: UseFormWatch<AddTaskFormData>;
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

// helper to get days based on month/year
function getDaysInMonth(month: string, year: string): number {
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);
  if (m === 2 && isLeapYear(y)) return 29;
  else if (m === 2) return 28;
  else if (m === 4 || m === 6 || m === 9 || m === 11) return 30;
  else return 31;
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

const AddTaskForm2 = ({
  control,
  watch,
}: AddTaskForm2Props): React.ReactElement => {
  const isRepeating = watch("isRepeating");
  const startMonth = watch("startMonth");
  const startYear = watch("startYear");
  const endMonth = watch("endMonth");
  const endYear = watch("endYear");

  const startDays = Array.from(
    { length: getDaysInMonth(startMonth, startYear) },
    (_, i) => String(i + 1),
  );
  const endDays = Array.from(
    { length: getDaysInMonth(endMonth, endYear) },
    (_, i) => String(i + 1),
  );

  const taskCategory = watch("taskCategory");

  return (
    <Flex flexDirection="column" gap="1.5rem" width="100%">
      {/* Task Name */}
      <FormControl>
        <FormLabel color="gray.600" marginBottom="0.38rem" fontWeight="normal">
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
        <FormLabel color="gray.600" marginBottom="0.38rem" fontWeight="normal">
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
        <FormLabel color="gray.600" marginBottom="0.38rem" fontWeight="normal">
          Instructions:
        </FormLabel>
        <Controller
          control={control}
          name="instructions"
          rules={{
            required: "Please fill out instructions.",
            validate: {
              // TODO: soooo this doesnt work either gg
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
            <TextArea
              value={field.value}
              onChange={field.onChange}
              error={error?.message}
              required={true}
            />
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
          >
            Start Date:
          </FormLabel>
          <Flex gap="0.75rem">
            {/* Month */}
            <Flex flex="2">
              <Controller
                control={control}
                name="startMonth"
                rules={{ required: true }}
                render={({ field, fieldState: { error } }) => (
                  <SingleSelect
                    values={MONTHS}
                    selected={field.value}
                    onSelect={field.onChange}
                    placeholder="Enter month"
                    error={!!error}
                  />
                )}
              />
            </Flex>
            {/* Day */}
            <Flex flex="1">
              <Controller
                control={control}
                name="startDay"
                rules={{ required: true }}
                render={({ field, fieldState: { error } }) => (
                  <SingleSelect
                    values={startDays} // TODO: fix this shit later dawg to actually get the right number of days
                    selected={field.value}
                    onSelect={field.onChange}
                    placeholder="Enter date"
                    error={!!error}
                  />
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
                    onSelect={field.onChange}
                    placeholder="Enter year"
                    error={!!error}
                  />
                )}
              />
            </Flex>
          </Flex>
        </FormControl>
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
            >
              Scheduled Start Time:
            </FormLabel>
            <Flex gap="0.75rem">
              {/* Start Hour */}
              <Flex flex="1">
                <Controller
                  control={control}
                  name="startHour"
                  rules={{ required: true }}
                  render={({ field, fieldState: { error } }) => (
                    <SingleSelect
                      values={HOURS}
                      selected={field.value}
                      onSelect={field.onChange}
                      placeholder="Enter hour"
                      error={!!error}
                    />
                  )}
                />
              </Flex>
              : {/* TODO: UNCHUZZ THIS ITS SO OFF CENTER LOL */}
              {/* Start Minute */}
              <Flex flex="1">
                <Controller
                  control={control}
                  name="startMinute"
                  rules={{ required: true }}
                  render={({ field, fieldState: { error } }) => (
                    <SingleSelect
                      values={MINUTES}
                      selected={field.value}
                      onSelect={field.onChange}
                      placeholder="Enter minute"
                      error={!!error}
                    />
                  )}
                />
              </Flex>
            </Flex>
          </FormControl>
        </Flex>

        {/* Scheduled End Time */}
        <Flex flexDirection="column" gap="0.375rem" flex="1">
          <FormControl isRequired>
            <FormLabel
              color="gray.600"
              marginBottom="0.38rem"
              fontWeight="normal"
            >
              Scheduled End Time:
            </FormLabel>
            <Flex gap="0.75rem">
              {/* End Hour */}
              <Flex flex="1">
                <Controller
                  control={control}
                  name="endHour"
                  rules={{ required: true }}
                  render={({ field, fieldState: { error } }) => (
                    <SingleSelect
                      values={HOURS}
                      selected={field.value}
                      onSelect={field.onChange}
                      placeholder="Enter hour"
                      error={!!error}
                    />
                  )}
                />
              </Flex>
              : {/* TODO: UNCHUZZ THIS ITS SO OFF CENTER LOL */}
              {/* End Minute */}
              <Flex flex="1">
                <Controller
                  control={control}
                  name="endMinute"
                  rules={{ required: true }}
                  render={({ field, fieldState: { error } }) => (
                    <SingleSelect
                      values={MINUTES}
                      selected={field.value}
                      onSelect={field.onChange}
                      placeholder="Enter minute"
                      error={!!error}
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
              rules={{ required: "Please select an option" }}
              render={({ field, fieldState: { error } }) => (
                <Flex flexDirection="column" gap="0.38rem">
                  <FormLabel
                    color="gray.600"
                    marginBottom="0.38rem"
                    fontWeight="normal"
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
                            m={0}
                            textStyle="body"
                            color={isSelected ? "white" : "gray.700"}
                          >
                            {day}
                          </Text>
                        </Flex>
                      );
                    })}
                  </Flex>
                  {error && (
                    <Text m={0} color="red.500" fontSize="0.75rem">
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
              >
                Recurring Cadences:
              </FormLabel>
              <Controller
                control={control}
                name="recurringCadences"
                rules={{
                  required: isRepeating ? "Please select a cadence." : false,
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
                      <Text m={0} color="red.500" fontSize="0.75rem">
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
                        onSelect={field.onChange}
                        placeholder="Enter month"
                        error={!!error}
                      />
                    )}
                  />
                </Flex>
                {/* Day */}
                <Flex flex="1">
                  <Controller
                    control={control}
                    name="endDay"
                    render={({ field, fieldState: { error } }) => (
                      <SingleSelect
                        values={endDays} // TODO: fix this shit later dawg to actually get the right number of days
                        selected={field.value}
                        onSelect={field.onChange}
                        placeholder="Enter date"
                        error={!!error}
                      />
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
                        onSelect={field.onChange}
                        placeholder="Enter year"
                        error={!!error}
                      />
                    )}
                  />
                </Flex>
              </Flex>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};

export default AddTaskForm2;
