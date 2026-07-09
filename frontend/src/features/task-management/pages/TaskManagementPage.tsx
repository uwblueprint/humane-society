import { useDisclosure, useBreakpointValue } from "@chakra-ui/react";
import React, { useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import TaskManagementTable from "../components/TaskManagementTable";
import TaskDetailsModal from "../components/TaskDetailsModal";
import { TableWrapper } from "../../../components/common/table";
import { type Task } from "../../../types/TaskTypes";
import Button from "../../../components/common/Button";
import { ADD_TASK_TEMPLATE_PAGE } from "../../../constants/Routes";
import TaskTemplateAPIClient from "../../../APIClients/TaskTemplateAPIClient";
import Pagination from "../../../components/common/Pagination";
import { getCurrentUserRole } from "../../../utils/CommonUtils";
import UserRoles from "../../../constants/UserConstants";

const TaskManagementPage = (): React.ReactElement => {
  const history = useHistory();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState<string>("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const addButtonLabel = useBreakpointValue({ base: "Add", md: "Add Task Template" });
  const searchPlaceholder = useBreakpointValue({
    base: "Search",
    md: "Search for a task...",
  });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasError, setHasError] = useState<boolean>(false);
  const numTasksPerPage = 10;
  const isAdmin = getCurrentUserRole() === UserRoles.ADMIN;

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    onOpen();
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearch("");
    setPage(1);
  };

  const handleAddTaskTemplate = () => {
    history.push(ADD_TASK_TEMPLATE_PAGE);
  };

  // Reset to the first page whenever the result set changes, otherwise a stale
  // page number can slice past the end of the filtered list and render the
  // "no match" empty state even though there are matches.
  const handleFilterChange = (selectedFilters: Record<string, string[]>) => {
    setFilters(selectedFilters);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(
    (vals) => vals && vals.length > 0,
  );
  const hasSearch = search.trim() !== "";

  const filteredTasks = useMemo(() => {
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
  }, [hasActiveFilters, hasSearch, filters, search, tasks]);

  const filteredTasksLength = filteredTasks.length;

  const getTasks = async () => {
    try {
      const fetchedTasks = await TaskTemplateAPIClient.getAllTaskTemplates();

      if (fetchedTasks != null) {
        setTasks(fetchedTasks);
        setHasError(false);
      }
    } catch (error) {
      setTasks([]);
      setHasError(true);
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
        searchPlaceholder,
        actionButton: isAdmin ? (
          <Button
            variant="dark-blue"
            size="medium"
            onClick={handleAddTaskTemplate}
          >
            {addButtonLabel}
          </Button>
        ) : undefined,
      }}
      bottomContent={
        <Pagination
          value={page}
          onChange={(newPage) => setPage(newPage)}
          numberOfItems={filteredTasksLength}
          itemsPerPage={numTasksPerPage}
        />
      }
    >
      <TaskManagementTable
        tasks={filteredTasks.slice(
          (page - 1) * numTasksPerPage,
          page * numTasksPerPage,
        )}
        clearFilters={handleClearFilters}
        onTaskClick={handleTaskClick}
        hasError={hasError}
        hasActiveFilters={hasActiveFilters}
        hasSearch={hasSearch}
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
