import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Box, Flex, Spacer, Text, useToast } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useHistory, useParams } from "react-router-dom";
import Button from "../../../components/common/Button";
import AddTaskTemplateSelection from "../components/add-task-form/TaskTemplateSelection";
import AddTaskForm2 from "../components/add-task-form/AddTaskForm2";
import AddTaskForm3 from "../components/add-task-form/AddTaskForm3";
import { AddTaskFormData } from "../components/add-task-form/AddTaskFormTypes";
import TaskAPIClient from "../../../APIClients/TaskAPIClient";
import TaskTemplateAPIClient from "../../../APIClients/TaskTemplateAPIClient";
import { User } from "../../../types/UserTypes";
import { MONTH_NAME_TO_NUMBER } from "../../../utils/CommonUtils";

interface AddTaskFormProps {
  petId: number;
  petName: string;
  petColorLevel: number;
  isEditMode?: boolean;
}

const AddTaskForm = ({
  petId,
  petName,
  petColorLevel,
  isEditMode = false,
}: AddTaskFormProps): React.ReactElement => {
  const history = useHistory();
  const toast = useToast();
  const { taskId } = useParams<{ taskId: string }>();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedUser, onSelectUser] = useState<User | null>(null);
  const [existingUserId, setExistingUserId] = useState<number | null>(null);

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

  useEffect(() => {
    if (!isEditMode || !taskId) return;

    const fetchTaskData = async () => {
      try {
        const task = await TaskAPIClient.getTask(Number(taskId));
        const recurrence = await TaskAPIClient.getRecurrence(Number(taskId));
        setExistingUserId(task.userId ?? null);
        const template = await TaskTemplateAPIClient.getTaskTemplate(
          task.taskTemplateId,
        );

        setValue("selectedTemplate", template);
        setValue("taskName", template.name);
        setValue("taskCategory", template.category);

        if (task.scheduledStartTime) {
          const date = new Date(task.scheduledStartTime);
          setValue(
            "startMonth",
            date.toLocaleString("default", { month: "long" }),
          );
          setValue("startDay", String(date.getDate()));
          setValue("startYear", String(date.getFullYear()));
          setValue("startHour", String(date.getHours()).padStart(2, "0"));
          setValue("startMinute", String(date.getMinutes()).padStart(2, "0"));
        }

        if (task.notes) {
          setValue("instructions", task.notes);
        }

        if (recurrence) {
          setValue("isRepeating", true);
          setValue("recurringDays", recurrence.days ?? []);
          setValue("recurringCadences", recurrence.cadence);
          if (recurrence.endDate) {
            const end = new Date(recurrence.endDate);
            setValue(
              "endMonth",
              end.toLocaleString("default", { month: "long" }),
            );
            setValue("endDay", String(end.getDate()));
            setValue("endYear", String(end.getFullYear()));
          }
        }
      } catch (error) {
        toast({
          title: "Failed to load task",
          description: `${error}`,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    };
    fetchTaskData();
  }, [isEditMode, setValue, taskId, toast]);

  const selectedTemplate = watch("selectedTemplate");
  const isRepeating = watch("isRepeating");
  const hasColorLevelMismatch =
    selectedUser !== null && selectedUser.colorLevel < petColorLevel;

  const validateStep2Fields = async (): Promise<boolean> => {
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
        ? (["recurringDays", "recurringCadences"] as (keyof AddTaskFormData)[])
        : []),
      ...(isRepeating && getValues("endMonth")
        ? (["endMonth", "endDay", "endYear"] as (keyof AddTaskFormData)[])
        : []),
    ];
    return trigger(validateFields);
  };

  const handleNextPage1 = async () => {
    const isValid = await trigger("selectedTemplate");
    if (isValid && selectedTemplate) {
      setValue("taskName", selectedTemplate.name);
      setValue("taskCategory", selectedTemplate.category);
      if (!isEditMode) {
        setValue("instructions", selectedTemplate.instructions);
      }
      setCurrentStep(2);
    }
  };

  const handleNextPage2 = async () => {
    const isValid = await validateStep2Fields();
    if (isValid) {
      setCurrentStep(3);
    }
  };

  const handleSave = async () => {
    if (isEditMode) {
      const isValid = await validateStep2Fields();
      if (!isValid) return;
    }
    const {
      selectedTemplate: template,
      instructions,
      startMonth,
      startDay,
      startYear,
      startHour,
      startMinute,
      endHour,
      endMinute,
      recurringDays,
      recurringCadences,
      endMonth,
      endDay,
      endYear,
    } = getValues();

    if (!template) return;

    const scheduledStartTime = new Date(
      Number(startYear),
      MONTH_NAME_TO_NUMBER[startMonth] - 1,
      Number(startDay),
      Number(startHour),
      Number(startMinute),
    ).toISOString();

    const userId = isEditMode ? existingUserId : selectedUser?.id ?? null;
    const scheduledEndDate = new Date(
      Number(startYear),
      MONTH_NAME_TO_NUMBER[startMonth] - 1,
      Number(startDay),
      Number(endHour),
      Number(endMinute),
    );
    if (scheduledEndDate <= new Date(scheduledStartTime)) {
      scheduledEndDate.setDate(scheduledEndDate.getDate() + 1);
    }
    const scheduledEndTime = scheduledEndDate.toISOString();

    const userId = selectedUser?.id ?? null;

    try {
      if (isEditMode) {
        await TaskAPIClient.updateTask(Number(taskId), {
          userId,
          petId,
          taskTemplateId: template.id,
          scheduledStartTime,
          notes: instructions,
        });
      } else if (!isRepeating) {
        await TaskAPIClient.createTask({
          userId,
          petId,
          taskTemplateId: template.id,
          scheduledStartTime,
          scheduledEndTime,
          notes: instructions,
        });
      } else {
        let endDate: string | null = null;
        if (endMonth && endDay && endYear) {
          endDate = new Date(
            Number(endYear),
            MONTH_NAME_TO_NUMBER[endMonth] - 1,
            Number(endDay),
          ).toISOString();
        }
        await TaskAPIClient.createRecurringTask({
          task: {
            userId,
            petId,
            taskTemplateId: template.id,
            scheduledStartTime,
            scheduledEndTime,
            notes: instructions,
          },
          recurrence: {
            days: recurringDays,
            cadence: recurringCadences,
            endDate,
            exclusions: [],
          },
        });
      }

      toast({
        title: isEditMode ? "Task updated!" : "Task added!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      history.push(`/pet-profile/${petId}`);
    } catch (error) {
      toast({
        title: "Failed to save task",
        description: `${error}`,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
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
        {isEditMode ? "Edit a Task" : "Add Task"}
      </Text>

      <Box>
        {currentStep === 1 && (
          <AddTaskTemplateSelection
            petName={petName}
            control={control}
            setValue={setValue}
          />
        )}

        {currentStep === 2 && (
          <AddTaskForm2
            control={control}
            watch={watch}
            getValues={getValues}
            trigger={trigger}
          />
        )}

        {currentStep === 3 && !isEditMode && (
          <AddTaskForm3
            petColorLevel={petColorLevel}
            selectedUser={selectedUser}
            onSelectUser={onSelectUser}
          />
        )}

        <Flex align="stretch" mt="2rem" gap="1rem">
          <Text margin="0" alignSelf="center">
            {currentStep}/{isEditMode ? "2" : "3"}
          </Text>
          <Spacer />
          {currentStep === 1 && isEditMode && (
            <Button as="button" variant="red" size="medium" type="button">
              Delete Task
            </Button>
          )}
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
          {currentStep === 2 && !isEditMode && (
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
          {currentStep === 2 && isEditMode && (
            <Button
              as="button"
              variant="green"
              size="medium"
              onClick={handleSave}
              type="button"
            >
              Save
            </Button>
          )}
          {currentStep === 3 && (
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
          {currentStep === 3 && (
            <Button
              as="button"
              variant="green"
              size="medium"
              onClick={handleSave}
              type="button"
            >
              {hasColorLevelMismatch ? "Override" : "Save"}
            </Button>
          )}
        </Flex>
      </Box>
    </Flex>
  );
};

export default AddTaskForm;
