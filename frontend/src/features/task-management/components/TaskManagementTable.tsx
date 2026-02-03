import React from "react";
import { Text, Flex, Table, Thead, Tr, Th, Td, Tbody } from "@chakra-ui/react";
import { TableEmptyState } from "../../../components/common/table";
import { Task } from "../../../types/TaskTypes";
import TaskManagementTableSection from "./TaskManagementTableSection";

interface TaskManagementTableProps {
  tasks: Task[];
  clearFilters: () => void;
}

const TaskManagementTable = ({
  tasks,
  clearFilters,
}: TaskManagementTableProps): React.ReactElement => {
  return (
    <Flex width="100%" overflowX="auto">
      <Table width="100%" minWidth="50rem" textAlign="left" layout="fixed">
        <Thead borderBottom="1px solid" borderColor="gray.200">
          <Tr borderTop="1px solid" borderColor="gray.200">
            <Th width="20%" py="1rem" px="2.5rem">
              <Text color="gray.800" textStyle="subheading" m={0}>
                NAME
              </Text>
            </Th>
            <Th width="20%" py="1rem" px="0">
              <Text color="gray.800" textStyle="subheading" m={0}>
                CATEGORY
              </Text>
            </Th>
            <Th width="60%" py="1rem" pr="2.5rem" pl="4rem">
              <Text color="gray.800" textStyle="subheading" m={0}>
                INSTRUCTIONS
              </Text>
            </Th>
          </Tr>
        </Thead>

        {tasks.length === 0 ? (
          <Tbody>
            <Tr>
              <Td colSpan={3}>
                <TableEmptyState
                  message="No tasks currently match."
                  onClearFilters={clearFilters}
                />
              </Td>
            </Tr>
          </Tbody>
        ) : (
          <TaskManagementTableSection tasks={tasks} />
        )}
      </Table>
    </Flex>
  );
};

export default TaskManagementTable;
