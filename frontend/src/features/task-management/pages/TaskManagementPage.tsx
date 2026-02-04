import React, { useState, useMemo, useEffect } from "react";
import { Flex, Spinner, useToast } from "@chakra-ui/react";
import Button from "../../../components/common/Button";
import { useHistory } from "react-router-dom";
import { Task } from "../../../types/TaskTypes";
import TaskManagementTable from "../components/TaskManagementTable";
import TaskDetailsModal from "../components/TaskDetailsModal";
import { TableWrapper } from "../../../components/common/table";
import { ADD_TASK_TEMPLATE_PAGE } from "../../../constants/Routes";
import TaskTemplateAPIClient from "../../../APIClients/TaskTemplateAPIClient";

const TaskManagementPage = (): React.ReactElement => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const toast = useToast();

  const history = useHistory();
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState<string>("");

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const fetchedTasks = await TaskTemplateAPIClient.getAllTaskTemplates();
      if (fetchedTasks != null) {
        setTasks(fetchedTasks);
      }
    } catch (error) {
      setErrorMessage(`${error}`);
      toast({
        title: "Error",
        description: "Failed to fetch task templates",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

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
    return tasks
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
  }, [tasks, filters, search]);

  const handleRowClick = (taskId: number) => {
    setSelectedTaskId(taskId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTaskId(null);
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="50vh" width="100%">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  return (
    <>
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
        errorMessage={errorMessage}
        onDismissError={() => setErrorMessage(null)}
      >
        <TaskManagementTable
          tasks={filteredTasks}
          onRowClick={handleRowClick}
          clearFilters={handleClearFilters}
        />
      </TableWrapper>

      {selectedTaskId !== null && (
        <TaskDetailsModal 
          taskTemplateId={selectedTaskId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default TaskManagementPage;
