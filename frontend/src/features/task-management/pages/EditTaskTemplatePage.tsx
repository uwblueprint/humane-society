import { ChevronLeftIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useHistory, useParams } from "react-router-dom";
import TaskTemplateAPIClient from "../../../APIClients/TaskTemplateAPIClient";
import { ReactComponent as GamesIcon } from "../../../assets/icons/games.svg";
import { ReactComponent as HusbandryIcon } from "../../../assets/icons/husbandry.svg";
import { ReactComponent as MiscIcon } from "../../../assets/icons/misc.svg";
import { ReactComponent as PenTimeIcon } from "../../../assets/icons/pen_time.svg";
import { ReactComponent as TrainingIcon } from "../../../assets/icons/training.svg";
import { ReactComponent as WalkIcon } from "../../../assets/icons/walk.svg";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import SingleSelect from "../../../components/common/SingleSelect";
import TextArea from "../../../components/common/TextArea";
import { TASK_MANAGEMENT_PAGE } from "../../../constants/Routes";
import { TaskCategory } from "../../../types/TaskTypes";

interface TaskTemplateFormData {
  taskName: string;
  taskCategory: TaskCategory | null;
  taskInstructions: string;
}

const EditTaskTemplatePage = (): React.ReactElement => {
  const params = useParams<{ taskTemplateId: string }>();
  const taskTemplateId = parseInt(params.taskTemplateId, 10);
  const history = useHistory();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<TaskTemplateFormData>({
    defaultValues: {
      taskName: "",
      taskCategory: null,
      taskInstructions: "",
    },
  });

  const taskCategories = Object.values(TaskCategory);

  const taskCategoryIcons: Record<
    TaskCategory,
    React.FC<React.SVGProps<SVGSVGElement>>
  > = {
    [TaskCategory.WALK]: WalkIcon,
    [TaskCategory.GAMES]: GamesIcon,
    [TaskCategory.PEN_TIME]: PenTimeIcon,
    [TaskCategory.HUSBANDRY]: HusbandryIcon,
    [TaskCategory.TRAINING]: TrainingIcon,
    [TaskCategory.MISC]: MiscIcon,
  };

  const taskCategoryIconsArray = taskCategories.map(
    (category) => taskCategoryIcons[category],
  );

  useEffect(() => {
    const fetchUser = async () => {
      if (!taskTemplateId) return;

      try {
        const taskTemplateData = await TaskTemplateAPIClient.getTaskTemplate(
          taskTemplateId,
        );

        // Prepopulate form with task template data
        reset({
          taskName: taskTemplateData.name,
          taskCategory: taskTemplateData.category,
          taskInstructions: taskTemplateData.instructions,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch user data",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchUser();
  }, [reset, taskTemplateId, toast]);

  const handleBackClick = () => {
    if (isDirty) {
      setShowQuitModal(true);
    } else {
      history.push(TASK_MANAGEMENT_PAGE);
    }
  };

  const handleQuitEditing = () => {
    setShowQuitModal(false);
    history.push(TASK_MANAGEMENT_PAGE);
  };

  const handleKeepEditing = () => {
    setShowQuitModal(false);
  };

  const handleDeleteTaskTemplate = () => {
    // TODO: Open delete task template modal and remove toast
    toast({
      title: "Delete User",
      description: "Delete functionality not implemented yet",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const onSubmit = async (data: TaskTemplateFormData) => {
    setIsSubmitting(true);

    try {
      // Since the task category is required, we will always have a task category
      // to submit
      await TaskTemplateAPIClient.editTaskTemplate(taskTemplateId, {
        taskName: data.taskName,
        category: data.taskCategory as TaskCategory,
        instructions: data.taskInstructions,
      });

      // Navigate back to task management page
      history.push(TASK_MANAGEMENT_PAGE);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to edit task template",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Flex
      direction="column"
      width="100%"
      minHeight="100vh"
      bg="gray.50"
      position="relative"
    >
      <Flex
        direction="column"
        maxWidth="1200px"
        width="100%"
        margin="0 auto"
        p="2.5rem"
      >
        <Flex
          alignItems="center"
          gap="0.5rem"
          mb="2rem"
          cursor="pointer"
          onClick={handleBackClick}
          _hover={{ opacity: 0.7 }}
          width="fit-content"
        >
          <ChevronLeftIcon color="gray.600" boxSize="1.25rem" />
          <Text
            color="gray.600"
            fontSize="16px"
            fontWeight="500"
            lineHeight="1.25rem"
            m={0}
          >
            Back to Task Management
          </Text>
        </Flex>

        <Text fontSize="24px" fontWeight="600" color="gray.800" mb="2rem">
          Edit Task Template
        </Text>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="2rem">
            <Controller
              name="taskName"
              control={control}
              rules={{ required: "Field is required." }}
              render={({ field }) => (
                <Input
                  label="Task Name"
                  placeholder="Morning walk"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.taskName?.message}
                  required
                />
              )}
            />

            <Box>
              <Controller
                name="taskCategory"
                control={control}
                rules={{
                  required: "Please select an option from the dropdown.",
                }}
                render={({ field }) => (
                  <SingleSelect
                    label="Task Category"
                    values={taskCategories}
                    selected={field.value}
                    onSelect={field.onChange}
                    placeholder="Click for options"
                    icons={taskCategoryIconsArray}
                    error={!!errors.taskCategory}
                    required
                  />
                )}
              />
              {errors.taskCategory && (
                <Text fontSize="12px" color="red.500" mt="0.5rem">
                  {errors.taskCategory.message}
                </Text>
              )}
            </Box>

            <Controller
              name="taskInstructions"
              control={control}
              rules={{
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
              render={({ field }) => (
                <TextArea
                  label="Instructions"
                  placeholder="Write task instructions here"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.taskInstructions?.message}
                  rows={8}
                />
              )}
            />

            <Flex justifyContent="flex-end" gap="1.5rem" mt="2rem">
              <Button
                variant="red"
                size="medium"
                onClick={handleDeleteTaskTemplate}
                type="button"
              >
                Delete User
              </Button>
              <Button
                type="submit"
                variant="green"
                size="medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </Flex>
          </Flex>
        </form>
      </Flex>

      {/* Quit Editing Modal */}
      <Modal
        isOpen={showQuitModal}
        onClose={handleKeepEditing}
        isCentered
        closeOnOverlayClick={false}
      >
        <ModalOverlay bg="blackAlpha.500" zIndex={1400} />
        <ModalContent
          maxWidth="400px"
          mx="1rem"
          zIndex={1500}
          bg="white"
          borderRadius="8px"
          boxShadow="0 10px 25px rgba(0, 0, 0, 0.15)"
        >
          <ModalHeader
            fontSize="20px"
            fontWeight="600"
            pb="1rem"
            color="gray.800"
          >
            Quit Editing?
          </ModalHeader>
          <ModalBody pb="1.5rem">
            <Text fontSize="16px" color="gray.600">
              Changes you made so far will not be saved.
            </Text>
          </ModalBody>
          <ModalFooter gap="1rem" pt="0">
            <Button variant="white" size="medium" onClick={handleKeepEditing}>
              Keep Editing
            </Button>
            <Button variant="red" size="medium" onClick={handleQuitEditing}>
              Leave
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default EditTaskTemplatePage;
