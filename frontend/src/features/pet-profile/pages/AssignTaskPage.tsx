import React, { useEffect, useState, useMemo } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { Flex, Text, useToast } from "@chakra-ui/react";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import Button from "../../../components/common/Button";
import UserAPIClient from "../../../APIClients/UserAPIClient";
import TaskAPIClient from "../../../APIClients/TaskAPIClient";
import { User } from "../../../types/UserTypes";
import UserSelection from "../components/UserSelection";
import AssignTaskScopeModal from "../components/AssignTaskScopeModal";

const AssignTaskPage = (): React.ReactElement => {
  const history = useHistory();
  const location = useLocation<{ preselectedUser?: User }>();
  const params = useParams<{ id: string; taskId: string }>();
  const petId = Number(params.id);
  const taskId = Number(params.taskId);
  const queryParams = new URLSearchParams(location.search);
  const instanceDate = queryParams.get("date") ?? undefined;
  const toast = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(
    location.state?.preselectedUser ?? null,
  );
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [isScopeModalOpen, setIsScopeModalOpen] = useState<boolean>(false);

  const usersPerPage = 10;

  // fetch users
  const getUsers = async () => {
    try {
      const fetchedUsers = await UserAPIClient.get();
      if (fetchedUsers != null) setUsers(fetchedUsers);
    } catch (error) {
      setErrorMessage(`${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    TaskAPIClient.getRecurrence(taskId).then((recurrence) => {
      setIsRecurring(recurrence !== null);
    });
  }, [taskId]);

  // filters users based on search
  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  }, [users, search]);

  const pagedUsers = filteredUsers.slice(
    (page - 1) * usersPerPage,
    page * usersPerPage,
  );

  const handleSearch = (value: string) => {
    setSelectedUser(null);
    setSearch(value);
    setPage(1);
  };

  const handleRowClick = (user: User) => {
    setSelectedUser(user);
  };

  const handleClearSelection = () => {
    setSelectedUser(null);
    setSearch("");
  };

  const handleBackClick = () => {
    history.push(`/pet-profile/${petId}`);
  };

  const performAssign = async (single: boolean) => {
    if (!selectedUser) return;
    try {
      await TaskAPIClient.assignUser(
        taskId,
        selectedUser.id,
        undefined,
        instanceDate,
        single,
      );
      toast({
        title: "Success",
        description: "Task assigned successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      history.push(`/pet-profile/${petId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign task.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSaveClick = () => {
    if (!selectedUser) return;
    if (isRecurring) {
      setIsScopeModalOpen(true);
      return;
    }
    performAssign(true);
  };

  const handleScopeConfirm = (single: boolean) => {
    setIsScopeModalOpen(false);
    performAssign(single);
  };

  return (
    <Flex flexDirection="column" width="100%" gap="1.5rem" paddingBottom="1rem">
      {/* back to pet profile */}
      <Flex
        align="center"
        gap="0.5rem"
        cursor="pointer"
        onClick={handleBackClick}
        _hover={{ opacity: 0.7 }}
      >
        <ChevronLeftIcon color="gray.600" boxSize="1.25rem" />
        <Text textStyle="body" color="gray.600" m={0}>
          Back to Pet Profile
        </Text>
      </Flex>

      {/* title */}
      <Text textStyle="h2" m={0}>
        Assign a Task
      </Text>

      <UserSelection
        search={search}
        selectedUser={selectedUser}
        pagedUsers={pagedUsers}
        filteredUsers={filteredUsers}
        page={page}
        errorMessage={errorMessage}
        usersPerPage={usersPerPage}
        loading={loading}
        onSearch={handleSearch}
        onRowClick={handleRowClick}
        onPageChange={setPage}
        onClearSelection={handleClearSelection}
        hasColorLevelMismatch={false}
      />

      {/* save button */}
      <Flex justify="flex-end">
        <Button
          as="button"
          type="button"
          variant="green"
          onClick={handleSaveClick}
          disabled={!selectedUser}
        >
          Save
        </Button>
      </Flex>

      <AssignTaskScopeModal
        open={isScopeModalOpen}
        onCancel={() => setIsScopeModalOpen(false)}
        onConfirm={handleScopeConfirm}
      />
    </Flex>
  );
};

export default AssignTaskPage;
