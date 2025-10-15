import React, { useState } from "react";
import {
  Flex,
  Text,
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import Input from "../components/common/Input";
import TextArea from "../components/common/TextArea";
import SingleSelect from "../components/common/SingleSelect";
import Button from "../components/common/Button";
import { TaskCategory } from "../types/TaskTypes";
import { TASK_MANAGEMENT_PAGE } from "../constants/Routes";
import { ReactComponent as HusbandryIcon } from "../assets/icons/husbandry.svg";
import { ReactComponent as PenTimeIcon } from "../assets/icons/pen_time.svg";
import { ReactComponent as GamesIcon } from "../assets/icons/games.svg";
import { ReactComponent as TrainingIcon } from "../assets/icons/training.svg";
import { ReactComponent as WalkIcon } from "../assets/icons/walk.svg";
import { ReactComponent as MiscIcon } from "../assets/icons/misc.svg";

interface TaskTemplateForm {
  taskName: string;
  taskCategory: TaskCategory | null;
  taskInstructions: string;
}

interface FormErrors {
  taskName?: string;
  taskCategory?: string;
  taskInstructions?: string;
}

const AddTaskTemplatePage = (): React.ReactElement => {
  const history = useHistory();
  const [formData, setFormData] = useState<TaskTemplateForm>({
    taskName: "",
    taskCategory: null,
    taskInstructions: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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

  const handleBackClick = () => {
    if (hasChanges) {
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

  const handleTaskNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, taskName: event.target.value });
    setHasChanges(true);
    if (errors.taskName) {
      setErrors({ ...errors, taskName: undefined });
    }
  };

  const handleCategoryChange = (category: TaskCategory) => {
    setFormData({ ...formData, taskCategory: category });
    setHasChanges(true);
    if (errors.taskCategory) {
      setErrors({ ...errors, taskCategory: undefined });
    }
  };

  const handleInstructionsChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, taskInstructions: event.target.value });
    setHasChanges(true);
    if (errors.taskInstructions) {
      setErrors({ ...errors, taskInstructions: undefined });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.taskName.trim()) {
      newErrors.taskName = "Field is required.";
    }

    if (!formData.taskCategory) {
      newErrors.taskCategory = "Please select an option from the dropdown.";
    }

    if (!formData.taskInstructions.trim()) {
      newErrors.taskInstructions = "Information must not exceed 10,000 words.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Console log the form data as requested
      console.log({
        taskName: formData.taskName,
        taskCategory: formData.taskCategory,
        taskInstructions: formData.taskInstructions,
      });

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Navigate back to task management page
      history.push(TASK_MANAGEMENT_PAGE);
    } catch (error) {
      console.error("Error submitting form:", error);
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
          Add Task Template
        </Text>

        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="2rem">
            <Input
              label="Task Name"
              value={formData.taskName}
              onChange={handleTaskNameChange}
              placeholder="Morning walk"
              error={errors.taskName}
              required
            />

            <Box>
              <SingleSelect
                label="Task Category"
                values={taskCategories}
                selected={formData.taskCategory}
                onSelect={handleCategoryChange}
                placeholder="Click for options"
                icons={taskCategoryIconsArray}
                error={!!errors.taskCategory}
                required
              />
              {errors.taskCategory && (
                <Text fontSize="12px" color="red.500" mt="0.5rem">
                  {errors.taskCategory}
                </Text>
              )}
            </Box>

            <TextArea
              label="Instructions"
              value={formData.taskInstructions}
              onChange={handleInstructionsChange}
              placeholder="Write task instructions here"
              error={errors.taskInstructions}
              rows={8}
              required
            />

            <Flex justifyContent="flex-end" mt="2rem">
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

export default AddTaskTemplatePage;
