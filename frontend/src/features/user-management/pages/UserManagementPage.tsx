import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  AlertIcon,
  Button,
  CloseButton,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import UserAPIClient from "../../../APIClients/UserAPIClient";
import { User } from "../../../types/UserTypes";

import Filter from "../../../components/common/Filter";
import Search from "../../../components/common/Search";
import UserManagementTable from "../components/UserManagementTable";
import AddUserFormModal, {
  AddUserRequest,
} from "../components/AddUserFormModal";

import Pagination from "../../../components/common/Pagination";

const UserManagementPage = (): React.ReactElement => {
  const [users, setUsers] = useState<User[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const numUsersPerPage = 10; // You can adjust this value as needed

  const handleFilterChange = (selectedFilters: Record<string, string[]>) => {
    setFilters(selectedFilters);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearch("");
  };

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        return Object.keys(filters).every((key) => {
          const filterVals = filters[key as keyof typeof filters];
          if (!filterVals || filterVals.length === 0) return true;

          const value = user[key as keyof User];

          if (Array.isArray(value)) {
            return filterVals.some((filter) =>
              (value as string[]).includes(filter),
            );
          }

          return filterVals.includes(value as string);
        });
      })
      .filter((user) => user.name.toLowerCase().includes(search.toLowerCase()));
  }, [filters, search, users]);

  const filteredUsersLength = filteredUsers.length;

  const getUsers = async () => {
    try {
      const fetchedUsers = await UserAPIClient.get();

      if (fetchedUsers != null) {
        setUsers(fetchedUsers);
      }
    } catch (error) {
      setErrorMessage(`${error}`);
    }
  };

  const handleInviteUser = async (formData: AddUserRequest) => {
    // TODO: Implement actual user invite API call
    // eslint-disable-next-line no-console
    console.log("Inviting user with data:", formData);
    // await UserAPIClient.invite(formData);

    // Refresh users list after successful invite
    await getUsers();
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <Flex direction="column" gap="2rem" width="100%" pt="2rem">
      {errorMessage && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {errorMessage}
          <CloseButton
            position="absolute"
            right="8px"
            top="8px"
            onClick={() => setErrorMessage(null)}
          />
        </Alert>
      )}
      <Flex
        padding="0 2.5rem"
        maxWidth="100vw"
        justifyContent="space-between"
        gap="1rem"
        alignItems="center"
      >
        <Flex gap="1rem" flex="1">
          <Filter
            type="userManagement"
            onChange={handleFilterChange}
            selected={filters}
          />
          <Search
            placeholder="Search for a user..."
            onChange={handleSearchChange}
            search={search}
          />
        </Flex>
        <Button
          colorScheme="blue"
          size="lg"
          onClick={onOpen}
          px="2rem"
          flexShrink={0}
        >
          Invite User
        </Button>
      </Flex>
      <UserManagementTable
        users={filteredUsers.slice(
          (page - 1) * numUsersPerPage,
          page * numUsersPerPage,
        )}
        clearFilters={handleClearFilters}
      />
      <Pagination
        value={page}
        onChange={(newPage) => setPage(newPage)}
        numberOfItems={filteredUsersLength}
        itemsPerPage={numUsersPerPage}
      />

      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent maxW="600px">
          <ModalHeader
            fontSize="24px"
            fontWeight="600"
            color="gray.800"
            pb="1rem"
          >
            Invite User
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="2rem">
            <AddUserFormModal onSubmit={handleInviteUser} onSuccess={onClose} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default UserManagementPage;
