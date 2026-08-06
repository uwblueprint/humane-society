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
  useBreakpointValue,
} from "@chakra-ui/react";
import { TableEmptyState } from "../../../components/common/table";
import { Task } from "../../../types/TaskTypes";
import TaskManagementTableSection from "./TaskManagementTableSection";

interface TaskManagementTableProps {
  tasks: Task[];
  clearFilters: () => void;
  onTaskClick: (task: Task) => void;
  hasError: boolean;
  hasActiveFilters: boolean;
  hasSearch: boolean;
}

const TaskManagementTable = ({
  tasks,
  clearFilters,
  onTaskClick,
  hasError,
  hasActiveFilters,
  hasSearch,
}: TaskManagementTableProps): React.ReactElement => {
  const colSpan = useBreakpointValue({ base: 2, md: 3 }) ?? 3;

  const renderEmptyState = () => {
    if (hasError) {
      return (
        <TableEmptyState
          message="Unable to load templates."
          linkLabel="Refresh page"
          onLinkClick={() => window.location.reload()}
        />
      );
    }

    if (hasActiveFilters || hasSearch) {
      return (
        <TableEmptyState
          message="No templates currently match."
          linkLabel="Clear all"
          onLinkClick={clearFilters}
        />
      );
    }

    return <TableEmptyState message="No templates to display." />;
  };

  return (
    <Flex width="100%" overflowX={{ base: "hidden", md: "auto" }}>
      <Table
        width="100%"
        minWidth={{ base: "0", md: "50rem" }}
        textAlign="left"
        layout="fixed"
      >
        <Thead borderBottom="1px solid" borderColor="gray.200">
          <Tr borderTop="1px solid" borderColor="gray.200">
            <Th width={{ base: "50%", md: "20%" }} py="1rem" px="2.5rem">
              <Text color="gray.800" textStyle="subheading" m={0}>
                NAME
              </Text>
            </Th>
            <Th
              width={{ base: "50%", md: "20%" }}
              py="1rem"
              pl={{ base: "1.5rem", md: "0" }}
              pr="0"
            >
              <Text color="gray.800" textStyle="subheading" m={0}>
                CATEGORY
              </Text>
            </Th>
            <Th
              display={{ base: "none", md: "table-cell" }}
              width="60%"
              py="1rem"
              pr="2.5rem"
              pl="4rem"
            >
              <Text color="gray.800" textStyle="subheading" m={0}>
                INSTRUCTIONS
              </Text>
            </Th>
          </Tr>
        </Thead>

        {tasks.length === 0 ? (
          <Tbody>
            <Tr>
              <Td colSpan={colSpan} borderBottom="none">
                {renderEmptyState()}
              </Td>
            </Tr>
          </Tbody>
        ) : (
          <TaskManagementTableSection tasks={tasks} onTaskClick={onTaskClick} />
        )}
      </Table>
    </Flex>
  );
};

export default TaskManagementTable;
