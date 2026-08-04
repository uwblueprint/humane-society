import React, { useEffect, useState, useMemo, useContext } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { Flex, Text, useToast } from "@chakra-ui/react";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import Button from "../../../components/common/Button";
import UserAPIClient from "../../../APIClients/UserAPIClient";
import TaskAPIClient from "../../../APIClients/TaskAPIClient";
import TaskTemplateAPIClient from "../../../APIClients/TaskTemplateAPIClient";
import PetAPIClient from "../../../APIClients/PetAPIClient";
import { User } from "../../../types/UserTypes";
import UserRoles from "../../../constants/UserConstants";
import UserSelection from "../components/UserSelection";
import AuthContext from "../../../contexts/AuthContext";

const AssignTaskPage = (): React.ReactElement => {
  const history = useHistory();
  const { authenticatedUser } = useContext(AuthContext);
  const location = useLocation<{ preselectedUser?: User }>();
  const params = useParams<{ id: string; taskId: string }>();
  const petId = Number(params.id);
  const taskId = Number(params.taskId);
  const toast = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(
    location.state?.preselectedUser ?? null,
  );
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previousUserId, setPreviousUserId] = useState<number | null>(null);
  const [previousUserName, setPreviousUserName] = useState<string | null>(null);
  const [taskTemplateName, setTaskTemplateName] = useState<string>("");
  const [petName, setPetName] = useState<string>("");

  const usersPerPage = 10;

  // fetch users
  const getUsers = async () => {
    try {
      const fetchedUsers = await UserAPIClient.get();
      if (fetchedUsers != null) {
        setUsers(fetchedUsers.filter((user) => user.role !== UserRoles.ADMIN));
      }
    } catch (error) {
      setErrorMessage(`${error}`);
    } finally {
      setLoading(false);
    }
  };

  // fetch task/pet/template details needed for interaction logging
  const getTaskContext = async () => {
    try {
      const task = await TaskAPIClient.getTask(taskId);
      const [template, pet] = await Promise.all([
        TaskTemplateAPIClient.getTaskTemplate(task.taskTemplateId),
        PetAPIClient.getPet(task.petId),
      ]);
      setTaskTemplateName(template.name);
      setPetName(pet.name);
      setPreviousUserId(task.userId ?? null);
      if (task.userId) {
        const previousUser = await UserAPIClient.get(task.userId);
        setPreviousUserName(
          `${previousUser.firstName} ${previousUser.lastName}`,
        );
      }
    } catch (error) {
      setErrorMessage(`${error}`);
    }
  };

  useEffect(() => {
    getUsers();
    getTaskContext();
  }, []);

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

  const handleSaveClick = async () => {
    if (!selectedUser) return;
    try {
      await TaskAPIClient.assignUser(taskId, selectedUser.id, {
        previousUserId,
        actorId: authenticatedUser?.id ?? 0,
        targetId: taskId,
        taskTemplateName,
        petName,
        oldUserName: previousUserName ?? undefined,
        newUserName: `${selectedUser.firstName} ${selectedUser.lastName}`,
        actorName: `${authenticatedUser?.firstName ?? ""} ${
          authenticatedUser?.lastName ?? ""
        }`,
      });
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
    </Flex>
  );
};

export default AssignTaskPage;
