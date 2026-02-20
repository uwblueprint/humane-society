import { CloseIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  IconButton,
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
import { useHistory } from "react-router-dom";
import TaskTemplateAPIClient from "../../../APIClients/TaskTemplateAPIClient";
import Button from "../../../components/common/Button";
import TaskCategoryBadge from "../../../components/common/TaskCategoryBadge";
import { EDIT_TASK_TEMPLATE_PAGE } from "../../../constants/Routes";
import { Task } from "../../../types/TaskTypes";

interface TaskDetailsModelsProps {
  taskTemplateId: number;
  isOpen: boolean;
  onClose: () => void;
}

const TaskDetailsModal = ({
  taskTemplateId,
  isOpen,
  onClose,
}: TaskDetailsModelsProps): React.ReactElement => {
  const toast = useToast();
  const history = useHistory();
  const [taskTemplateData, setTaskTemplateData] = useState<Task | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await TaskTemplateAPIClient.getTaskTemplate(
          taskTemplateId,
        );
        setTaskTemplateData(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch task template data",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };
    fetchUser();
  }, [taskTemplateId, toast]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg="gray.50" maxHeight="min(831px, calc(100vh - 8rem))">
        <ModalHeader paddingBlock="2rem" paddingInline="2.5rem">
          <Flex align="center" justify="space-between">
            <Text m={0} textStyle="h2Mobile" color="gray.700">
              Task Details
            </Text>

            <IconButton
              icon={<CloseIcon boxSize={4} />}
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Close modal"
            />
          </Flex>
        </ModalHeader>

        <Flex direction="column" height="100%" overflowY="auto">
          <ModalBody
            flex="1"
            display="flex"
            flexDirection="column"
            gap="2rem"
            paddingTop="0"
            paddingBottom="2rem"
            paddingInline="2.5rem"
            overflowY="auto"
          >
            <Box>
              <Text textStyle="h3" marginBottom="1rem" fontWeight="600">
                Task Name
              </Text>
              <Text color="gray.700" marginBottom="0" textStyle="body">
                {taskTemplateData?.name}
              </Text>
            </Box>

            <Box>
              <Text textStyle="h3" marginBottom="1rem" fontWeight="600">
                Task Category
              </Text>
              {taskTemplateData && (
                <TaskCategoryBadge taskCategory={taskTemplateData.category} />
              )}
            </Box>

            <Box>
              <Text textStyle="h3" marginBottom="1rem" fontWeight="600">
                Task Instructions
              </Text>
              <Text color="gray.700" marginBottom="0" textStyle="body">
                {taskTemplateData?.instructions
                  ? taskTemplateData.instructions
                  : "No instructions to display."}
              </Text>
            </Box>
          </ModalBody>

          <ModalFooter paddingInline="2.5rem">
            <Button
              variant="blue-outline"
              width="100%"
              onClick={() => {
                history.push(`${EDIT_TASK_TEMPLATE_PAGE}/${taskTemplateId}`);
              }}
            >
              Edit Task
            </Button>
          </ModalFooter>
        </Flex>
      </ModalContent>
    </Modal>
  );
};

export default TaskDetailsModal;
