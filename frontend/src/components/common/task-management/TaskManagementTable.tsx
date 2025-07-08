import React from "react";
import {
  Text,
  Flex,
  Table,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
  Box,
} from "@chakra-ui/react";
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
    <Box width="100%" overflowX="auto">
      <Table width="100%" minWidth="800px" textAlign="left" layout="fixed">
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
                <Flex
                  direction="column"
                  alignItems="center"
                  gap="1rem"
                  my="5rem"
                >
                  <Text m="0" textStyle="subheading">
                    No tasks currently match.
                  </Text>
                  <Text
                    m="0"
                    textStyle="h3"
                    color="blue.500"
                    cursor="pointer"
                    textDecoration="underline"
                    onClick={clearFilters}
                  >
                    Clear all
                  </Text>
                </Flex>
              </Td>
            </Tr>
          </Tbody>
        ) : (
          <TaskManagementTableSection tasks={tasks} />
        )}
      </Table>
    </Box>
  );
};

export default TaskManagementTable;
