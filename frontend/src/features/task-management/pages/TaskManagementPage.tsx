import React, { useState, useMemo } from "react";
import { useHistory } from "react-router-dom";
import TaskManagementTable from "../components/TaskManagementTable";
import { TableWrapper } from "../../../components/common/table";
import { mockTasks } from "../../../types/TaskTypes";
import Button from "../../../components/common/Button";
import { ADD_TASK_TEMPLATE_PAGE } from "../../../constants/Routes";

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
    <TableWrapper
      filterBarProps={{
        filterType: "taskManagement",
        filters,
        onFilterChange: handleFilterChange,
        search,
        onSearchChange: handleSearchChange,
        searchPlaceholder: "Search for a task...",
        actionButton: (
          <Button
            variant="dark-blue"
            size="medium"
            onClick={handleAddTaskTemplate}
          >
            Add Task Template
          </Button>
        ),
      }}
    >
      <TaskManagementTable tasks={filteredTasks} clearFilters={handleClearFilters} />
    </TableWrapper>
  );
};

export default TaskManagementPage;
