import React, { useState, useMemo } from "react";
import { Flex } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import TaskManagementTable from "../components/common/task-management/TaskManagementTable";
import Filter from "../components/common/Filter";
import Search from "../components/common/Search";
import { mockTasks } from "../types/TaskTypes";
import Button from "../components/common/Button";
import { ADD_TASK_TEMPLATE_PAGE } from "../constants/Routes";

const TaskManagementPage = (): React.ReactElement => {
  const history = useHistory();
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState<string>("");

  const handleClearFilters = () => {
    setFilters({});
    setSearch("");
  };

  const handleAddTaskTemplate = () => {
    history.push(ADD_TASK_TEMPLATE_PAGE);
  };

  const handleFilterChange = (selectedFilters: Record<string, string[]>) => {
    setFilters(selectedFilters);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const filteredTasks = useMemo(() => {
    return mockTasks
      .filter((task) => {
        return Object.keys(filters).every((key) => {
          const filterVals = filters[key];
          if (!filterVals || filterVals.length === 0) return true;
          return filterVals.includes(task[key as keyof typeof task] as string);
        });
      })
      .filter(
        (task) =>
          task.name.toLowerCase().includes(search.toLowerCase()) ||
          task.instructions.toLowerCase().includes(search.toLowerCase()),
      );
  }, [filters, search]);

  return (
    <Flex direction="column" gap="2rem">
      <Flex
        padding="0 2.5rem"
        maxWidth="100vw"
        justifyContent="space-between"
        gap="1rem"
        alignItems="center"
      >
        <Filter
          type="taskManagement"
          onChange={handleFilterChange}
          selected={filters}
        />
        <Flex gap="1rem" alignItems="center">
          <Search
            placeholder="Search for a task..."
            onChange={handleSearchChange}
            search={search}
          />
          <Button
            variant="dark-blue"
            size="medium"
            onClick={handleAddTaskTemplate}
          >
            Add Task Template
          </Button>
        </Flex>
      </Flex>
      <TaskManagementTable
        tasks={filteredTasks}
        clearFilters={handleClearFilters}
      />
    </Flex>
  );
};

export default TaskManagementPage;
