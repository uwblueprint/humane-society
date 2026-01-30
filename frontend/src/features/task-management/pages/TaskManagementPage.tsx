import { useDisclosure } from "@chakra-ui/react";
import React, { useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import TaskManagementTable from "../components/TaskManagementTable";
import TaskDetailsModal from "../components/TaskDetailsModal";
import { TableWrapper } from "../../../components/common/table";
import { type Task } from "../../../types/TaskTypes";
import Button from "../../../components/common/Button";
import { ADD_TASK_TEMPLATE_PAGE } from "../../../constants/Routes";
import TaskTemplateAPIClient from "../../../APIClients/TaskTemplateAPIClient";

const TaskManagementPage = (): React.ReactElement => {
  const history = useHistory();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState<string>("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    onOpen();
  };

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
    const hasActiveFilters = Object.values(filters).some(
      (vals) => vals && vals.length > 0,
    );
    const hasSearch = search.trim() !== "";

    // If no filters and no search, just return everything
    if (!hasActiveFilters && !hasSearch) return tasks;

    return tasks
      .filter((task: Task) => {
        return Object.keys(filters).every((key) => {
          const filterVals = filters[key];
          if (!filterVals || filterVals.length === 0) return true;
          return filterVals.includes(task[key as keyof typeof task] as string);
        });
      })
      .filter(
        (task: Task) =>
          task.name.toLowerCase().includes(search.toLowerCase()) ||
          task.instructions?.toLowerCase().includes(search.toLowerCase()),
      );
  }, [filters, search, tasks]);

  const getTasks = async () => {
    try {
      const fetchedTasks = await TaskTemplateAPIClient.getAllTaskTemplates();

      if (fetchedTasks != null) {
        setTasks(fetchedTasks);
      }
    } catch (error) {
      setTasks([]);
      // TODO: deprecate console use in frontend
      /* eslint-disable-next-line no-console */
      console.error("Could not fetch tasks");
    }
  };

  useEffect(() => {
    getTasks();
  }, []);

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
      <TaskManagementTable
        tasks={filteredTasks}
        clearFilters={handleClearFilters}
        onTaskClick={handleTaskClick}
      />
      {selectedTask && (
        <TaskDetailsModal
          isOpen={isOpen}
          onClose={onClose}
          taskTemplateId={selectedTask.id}
        />
      )}
    </TableWrapper>
  );
};

export default TaskManagementPage;
