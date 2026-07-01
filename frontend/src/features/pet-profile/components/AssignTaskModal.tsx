import { CloseIcon } from "@chakra-ui/icons";
import {
  Flex,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useMemo, useState } from "react";
import TaskAPIClient from "../../../APIClients/TaskAPIClient";
import UserAPIClient from "../../../APIClients/UserAPIClient";
import Button from "../../../components/common/Button";
import { User } from "../../../types/UserTypes";
import UserSelection from "./UserSelection";

interface AssignTaskModalProps {
  taskId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AssignTaskModal = ({
  taskId,
  isOpen,
  onClose,
  onSuccess,
}: AssignTaskModalProps): React.ReactElement => {
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const usersPerPage = 10;

  useEffect(() => {
    if (!isOpen) {
      setSelectedUser(null);
      setSearch("");
      setPage(1);
      return;
    }
    setLoading(true);
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
    getUsers();
  }, [isOpen]);

  const filteredUsers = useMemo(
    () =>
      users.filter((user) =>
        `${user.firstName} ${user.lastName}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [users, search],
  );

  const pagedUsers = filteredUsers.slice(
    (page - 1) * usersPerPage,
    page * usersPerPage,
  );

  const handleSearch = (value: string) => {
    setSelectedUser(null);
    setSearch(value);
    setPage(1);
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    try {
      await TaskAPIClient.assignUser(taskId, selectedUser.id);
      toast({
        title: "Success",
        description: "Task assigned successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onSuccess();
      onClose();
    } catch {
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
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg="gray.50">
        <ModalHeader paddingBlock="2rem" paddingInline="2.5rem">
          <Flex align="center" justify="space-between">
            <Text m={0} textStyle="h2Mobile" color="gray.700">
              Assign a Task
            </Text>
            <IconButton
              icon={<CloseIcon boxSize={4} />}
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Close modal"
            />
          </Flex>
        </ModalHeader>
        <ModalBody
          display="flex"
          flexDirection="column"
          gap="2rem"
          paddingTop="0"
          paddingBottom="1rem"
          paddingInline="2.5rem"
        >
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
            onRowClick={setSelectedUser}
            onPageChange={setPage}
            onClearSelection={() => {
              setSelectedUser(null);
              setSearch("");
            }}
            hasColorLevelMismatch={false}
          />
        </ModalBody>
        <ModalFooter
          paddingInline="2.5rem"
          paddingBottom="2.5rem"
          paddingTop="1rem"
          borderTop="1px solid"
          borderColor="gray.200"
          justifyContent="flex-end"
        >
          <Button
            as="button"
            type="button"
            variant="green"
            onClick={handleSave}
            disabled={!selectedUser}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AssignTaskModal;
