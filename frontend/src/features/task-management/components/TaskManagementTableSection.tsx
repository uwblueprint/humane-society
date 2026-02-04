import { Box, Tbody, Td, Text, Tr } from "@chakra-ui/react";
import React from "react";
import TaskCategoryBadge from "../../../components/common/TaskCategoryBadge";
import { Task } from "../../../types/TaskTypes";

interface TaskManagementTableSectionProps {
  tasks: Task[];
  onRowClick?: (taskId: number) => void;
}

const TaskManagementTableSection = ({
  tasks,
  onRowClick,
}: TaskManagementTableSectionProps): React.ReactElement => {
  return (
    <Tbody>
      {tasks.map((task) => (
        <Tr
          key={task.id}
          onClick={() => onRowClick?.(task.id)}
          cursor={onRowClick ? "pointer" : "default"}
          _hover={onRowClick ? {bg: "gray.50" }: undefined}
        >
          <Td width="20%" py="1rem" px="2.5rem">
            <Text textStyle="body" m={0} noOfLines={1}>
              {task.name}
            </Text>
          </Td>
          <Td width="20%" py="1rem" px="0">
            <TaskCategoryBadge taskCategory={task.category} />
          </Td>
          <Td width="60%" py="1rem" pr="2.5rem" pl="4rem">
            <Box>
              <Text textStyle="body" m={0} noOfLines={2}>
                {task.instructions}
              </Text>
            </Box>
          </Td>
        </Tr>
      ))}
    </Tbody>
  );
};

export default TaskManagementTableSection;
