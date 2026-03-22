import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Box, Flex, Spacer, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import Button from "../../../components/common/Button";
import AddTaskTemplateSelection from "../components/add-task-form/TaskTemplateSelection";
import AddTaskForm2 from "../components/add-task-form/AddTaskForm2";
import { AddTaskFormData } from "../components/add-task-form/AddTaskFormTypes";

interface AddTaskFormProps {
  petId: number;
  petName: string;
}

const AddTaskForm = ({
  petId,
  petName,
}: AddTaskFormProps): React.ReactElement => {
  const history = useHistory();

  const [currentStep, setCurrentStep] = useState(1);

  const today = new Date();
  const { control, setValue, watch, trigger, getValues } =
    useForm<AddTaskFormData>({
      mode: "onChange",
      defaultValues: {
        search: "",
        selectedTemplate: null,

        // page 2
        taskName: "",
        taskCategory: "",
        instructions: "",
        startMonth: today.toLocaleString("default", { month: "long" }),
        startDay: String(today.getDate()),
        startYear: String(today.getFullYear()),
        startMinute: "",
        startHour: "",
        endMinute: "",
        endHour: "",
        isRepeating: false,
        recurringDays: [],
        recurringCadences: "Weekly",
        endDay: "",
        endMonth: "",
        endYear: "",
      },
    });

  const selectedTemplate = watch("selectedTemplate");
  const isRepeating = watch("isRepeating");

  const handleNextPage1 = async () => {
    const isValid = await trigger("selectedTemplate");
    if (isValid && selectedTemplate) {
      setValue("taskName", selectedTemplate.name);
      setValue("taskCategory", selectedTemplate.category);
      setValue("instructions", selectedTemplate.instructions);
      setCurrentStep(2);
    }
  };

  const handleNextPage2 = async () => {
    const validateFields: (keyof AddTaskFormData)[] = [
      "instructions",
      "startMonth",
      "startDay",
      "startYear",
      "startHour",
      "startMinute",
      "endHour",
      "endMinute",
      ...(isRepeating
        ? (["recuringDays", "recurringCadences"] as (keyof AddTaskFormData)[])
        : []),
      ...(isRepeating && getValues("endMonth")
        ? (["endMonth", "endDay", "endYear"] as (keyof AddTaskFormData)[])
        : []),
    ];

    const isValid = await trigger(validateFields);
    if (isValid) {
      // TODO: setCurrentStep(3)
    }
  };

  const handlePreviousPage = async () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <Flex flexDirection="column" width="100%" gap="1.5rem" paddingBottom="1rem">
      {/* Back Button */}
      <Flex
        align="center"
        gap="0.5rem"
        cursor="pointer"
        onClick={() => history.push(`/pet-profile/${petId}`)}
        _hover={{ opacity: 0.7 }}
      >
        <ChevronLeftIcon color="gray.600" boxSize="1.25rem" />
        <Text textStyle="body" color="gray.600" m={0}>
          Back to Pet Profile
        </Text>
      </Flex>

      <Text textStyle="h2" m={0}>
        Add Task
      </Text>

      <Box>
        {currentStep === 1 && (
          <AddTaskTemplateSelection
            petName={petName}
            control={control}
            setValue={setValue}
          />
        )}

        {currentStep === 2 && <AddTaskForm2 control={control} watch={watch} getValues={getValues} trigger={trigger} />}

        <Flex align="stretch" mt="2rem" gap="1rem">
          <Text margin="0" alignSelf="center">
            {currentStep}/3
          </Text>
          <Spacer />
          {currentStep === 1 && (
            <Button
              as="button"
              variant="gray"
              size="medium"
              rightIcon={<ChevronRightIcon />}
              onClick={handleNextPage1}
              type="button"
              isDisabled={!selectedTemplate}
            >
              Next
            </Button>
          )}
          {currentStep === 2 && (
            <Button
              as="button"
              variant="gray"
              size="medium"
              leftIcon={<ChevronLeftIcon />}
              onClick={handlePreviousPage}
              type="button"
            >
              Previous
            </Button>
          )}
          {currentStep === 2 && (
            <Button
              as="button"
              variant="gray"
              size="medium"
              rightIcon={<ChevronRightIcon />}
              onClick={handleNextPage2}
              type="button"
            >
              Next
            </Button>
          )}
        </Flex>
      </Box>
    </Flex>
  );
};

export default AddTaskForm;
