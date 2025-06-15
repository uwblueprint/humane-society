import React, { useState, useMemo } from "react";
import { Flex, Button } from "@chakra-ui/react";
import TaskManagementTable from "../components/common/task-management/TaskManagementTable";
import Filter from "../components/common/Filter";
import Search from "../components/common/Search";
import { mockTasks } from "../types/TaskTypes";

const TaskManagementPage = (): React.ReactElement => {
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState<string>("");

  const handleClearFilters = () => {
    setFilters({});
    setSearch("");
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
      .filter((task) => 
        task.name.toLowerCase().includes(search.toLowerCase()) ||
        task.instructions.toLowerCase().includes(search.toLowerCase())
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
            bg="blue.700"
            color="white"
            textStyle="button"
            height="2.5rem"
            px="1.5rem"
            _hover={{ bg: "blue.600" }}
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
