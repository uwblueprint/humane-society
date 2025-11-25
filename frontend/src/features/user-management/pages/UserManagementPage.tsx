import React, { useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { Alert, AlertIcon, CloseButton, Flex } from "@chakra-ui/react";
import UserAPIClient from "../../../APIClients/UserAPIClient";
import { User } from "../../../types/UserTypes";

import Filter from "../../../components/common/Filter";
import Search from "../../../components/common/Search";
import UserManagementTable from "../components/UserManagementTable";
import Button from "../../../components/common/Button";

import Pagination from "../../../components/common/Pagination";
import * as Routes from "../../../constants/Routes";

const UserManagementPage = (): React.ReactElement => {
  const history = useHistory();
  const [users, setUsers] = useState<User[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);

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
      .filter(
        (user) =>
          user.firstName.toLowerCase().includes(search.toLowerCase()) ||
          user.lastName.toLowerCase().includes(search.toLowerCase()),
      );
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

  useEffect(() => {
    getUsers();
  }, []);

  const handleInviteUserClick = () => {
    history.push(Routes.INVITE_USER_PAGE);
  };

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
        <Filter
          type="userManagement"
          onChange={handleFilterChange}
          selected={filters}
        />
        <Flex gap="1rem" alignItems="center">
          <Search
            placeholder="Search for a user..."
            onChange={handleSearchChange}
            search={search}
          />
          <Button
            variant="dark-blue"
            size="medium"
            onClick={handleInviteUserClick}
          >
            Invite User
          </Button>
        </Flex>
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
    </Flex>
  );
};

export default UserManagementPage;
