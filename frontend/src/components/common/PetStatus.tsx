import React from "react";
import { Text, Box, Flex } from "@chakra-ui/react";
import { TaskStatus } from "../../types/TaskTypes";

const statusColor: Record<TaskStatus, string> = {
  [TaskStatus.NEEDS_CARE]: "red.400",
  [TaskStatus.DOES_NOT_NEED_CARE]: "gray.500",
  [TaskStatus.ASSIGNED]: "blue.500",
};

export interface PetStatusProps {
  status: TaskStatus;
}

const PetStatus = ({ status }: PetStatusProps): React.ReactElement => (
  <Flex align="center" gap="0.5rem">
    <Box boxSize="1rem" bg={statusColor[status]} borderRadius="full" />
    <Text textStyle="body" m={0}>
      {status}
    </Text>
  </Flex>
);

export default PetStatus;
