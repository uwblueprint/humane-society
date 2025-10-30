import React, { useEffect, useMemo, useState } from "react";
import { Alert, AlertIcon, CloseButton, Flex } from "@chakra-ui/react";
import UserAPIClient from "../../../APIClients/UserAPIClient";
import { User } from "../../../types/UserTypes";

import Filter from "../../../components/common/Filter";
import Search from "../../../components/common/Search";
import UserManagementTable from "../components/UserManagementTable";
import AddUserFormModal, {
  AddUserFormData,
} from "../components/AddUserFormModal";
import Button from "../../../components/common/Button";

import Pagination from "../../../components/common/Pagination";
import { colorLevelMap, AnimalTag } from "../../../types/TaskTypes";
import UserRoles from "../../../constants/UserConstants";

const UserManagementPage = (): React.ReactElement => {
  const [users, setUsers] = useState<User[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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

  useEffect(() => {
    getUsers();
  }, []);

  const handleInviteUser = async (formData: AddUserFormData) => {
    try {
      // Map ColorLevel enum to number (1-5)
      const colorLevelNumber = formData.colorLevel
        ? Object.entries(colorLevelMap).find(
            ([, value]) => value === formData.colorLevel,
          )?.[0]
        : "1";

      // Create the user with all the details
      await UserAPIClient.create({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role as UserRoles,
        phoneNumber: formData.phoneNumber || null,
        canSeeAllLogs: null,
        canAssignUsersToTasks: null,
        name: `${formData.firstName} ${formData.lastName}`,
        colorLevel: colorLevelNumber,
        animalTags: formData.animalTags,
      });

      // Send the invite email
      await UserAPIClient.invite(formData.email);

      // Refresh the user list
      await getUsers();
    } catch (error) {
      throw new Error(`Failed to invite user: ${error}`);
    }
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
            onClick={() => setIsModalOpen(true)}
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

      <AddUserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleInviteUser}
      />
    </Flex>
  );
};

export default UserManagementPage;
