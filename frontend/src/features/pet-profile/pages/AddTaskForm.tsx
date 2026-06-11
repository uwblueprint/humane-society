import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Box, Flex, Spacer, Text, useToast } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useHistory, useParams } from "react-router-dom";
import Button from "../../../components/common/Button";
import PopupModal from "../../../components/common/PopupModal";
import AddTaskTemplateSelection from "../components/add-task-form/TaskTemplateSelection";
import AddTaskForm2 from "../components/add-task-form/AddTaskForm2";
import AddTaskForm3 from "../components/add-task-form/AddTaskForm3";
import { AddTaskFormData } from "../components/add-task-form/AddTaskFormTypes";
import TaskAPIClient from "../../../APIClients/TaskAPIClient";
import TaskTemplateAPIClient from "../../../APIClients/TaskTemplateAPIClient";
import { User } from "../../../types/UserTypes";
import { MONTH_NAME_TO_NUMBER } from "../../../utils/CommonUtils";
import { RecurrenceTask } from "../../../types/TaskTypes";

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRecurringDeleteModal, setShowRecurringDeleteModal] = useState(false);
  const [deleteRecurringOption, setDeleteRecurringOption] = useState<"single" | "series">("single");
  const [isDeleting, setIsDeleting] = useState(false);
  const [recurrenceData, setRecurrenceData] = useState<RecurrenceTask | null>(null);

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
        setRecurrenceData(recurrence);
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

  const handleDeleteClick = () => {
    if (recurrenceData) {
      setDeleteRecurringOption("single");
      setShowRecurringDeleteModal(true);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleDeleteSingle = async () => {
    if (!taskId) return;
    setIsDeleting(true);
    try {
      await TaskAPIClient.deleteTask(Number(taskId));
      toast({
        title: "Task deleted!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      history.push(`/pet-profile/${petId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteRecurring = async () => {
    if (!taskId) return;
    setIsDeleting(true);
    try {
      const scheduledStartTime = new Date().toISOString();
      await TaskAPIClient.deleteRecurringTask(
        Number(taskId),
        scheduledStartTime,
        deleteRecurringOption === "single",
      );
      toast({
        title: "Task deleted!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      history.push(`/pet-profile/${petId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
      setShowRecurringDeleteModal(false);
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
            <Button as="button" variant="red" size="medium" type="button" onClick={handleDeleteClick}>
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

      <PopupModal
        open={showDeleteConfirm}
        title="Delete Task?"
        message="Are you sure you want to delete this task? This process cannot be undone."
        primaryButtonText="Delete"
        primaryButtonColor="red"
        onPrimaryClick={handleDeleteSingle}
        secondaryButtonText="Cancel"
        onSecondaryClick={() => setShowDeleteConfirm(false)}
        isPrimaryLoading={isDeleting}
      />

      {showRecurringDeleteModal && (
        <Flex
          top="0"
          left="0"
          position="fixed"
          height="100vh"
          width="100vw"
          bg="rgba(26, 32, 44, 0.6)"
          zIndex="1500"
          justifyContent="center"
          alignItems="center"
        >
          <Flex
            bg="white"
            align="center"
            direction="column"
            gap={{ base: "1.25rem", md: "1.875rem" }}
            width={{ base: "20.375rem", md: "33.625rem" }}
            pt={{ base: "2rem", md: "3.6875rem" }}
            pb={{ base: "2rem", md: "3.6875rem" }}
            pl={{ base: "2rem", md: "3rem" }}
            pr={{ base: "2rem", md: "3rem" }}
            borderRadius="md"
            boxShadow="lg"
          >
            <Text
              textStyle={{ base: "h3", md: "h1" }}
              color="blue.700"
              textAlign="center"
              m={0}
            >
              Delete Task?
            </Text>

            <Flex direction="column" gap="0.75rem" width="100%">
              <Flex
                align="center"
                gap="0.75rem"
                cursor="pointer"
                onClick={() => setDeleteRecurringOption("single")}
              >
                <Flex
                  boxSize="1.25rem"
                  borderRadius="full"
                  border="2px solid"
                  borderColor={deleteRecurringOption === "single" ? "blue.500" : "gray.300"}
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                >
                  {deleteRecurringOption === "single" && (
                    <Flex boxSize="0.625rem" borderRadius="full" bg="blue.500" />
                  )}
                </Flex>
                <Text textStyle={{ base: "bodyMobile", md: "body" }} color="gray.600" m={0}>
                  This task
                </Text>
              </Flex>

              <Flex
                align="center"
                gap="0.75rem"
                cursor="pointer"
                onClick={() => setDeleteRecurringOption("series")}
              >
                <Flex
                  boxSize="1.25rem"
                  borderRadius="full"
                  border="2px solid"
                  borderColor={deleteRecurringOption === "series" ? "blue.500" : "gray.300"}
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                >
                  {deleteRecurringOption === "series" && (
                    <Flex boxSize="0.625rem" borderRadius="full" bg="blue.500" />
                  )}
                </Flex>
                <Text textStyle={{ base: "bodyMobile", md: "body" }} color="gray.600" m={0}>
                  This and following tasks
                </Text>
              </Flex>
            </Flex>

            <Flex
              width="100%"
              height={{ base: "5rem", md: "3rem" }}
              minH="2rem"
              direction={{ base: "column-reverse", md: "row" }}
              gap={{ base: "1rem", md: "1.5rem" }}
              justifyContent="center"
            >
              <Button
                variant="gray"
                size="medium"
                onClick={() => setShowRecurringDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="red"
                size="medium"
                onClick={handleDeleteRecurring}
                isLoading={isDeleting}
              >
                Delete
              </Button>
            </Flex>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};

export default AddTaskForm;
