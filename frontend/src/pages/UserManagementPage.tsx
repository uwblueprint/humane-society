import React, { useEffect, useMemo, useState } from "react";
import { Alert, AlertIcon, CloseButton, Flex } from "@chakra-ui/react";
import UserAPIClient from "../APIClients/UserAPIClient";
import { User } from "../types/UserTypes";

import UserManagementTable from "../components/common/user-management/UserManagementTable";
import Filter from "../components/common/Filter";
import Search from "../components/common/Search";

// const handleUserSubmit = async (formData: AddUserRequest) => {
// eslint-disable-next-line no-useless-catch
// try {
//   await UserAPIClient.create({
//     firstName: formData.firstName,
//     lastName: formData.lastName,
//     phoneNumber: formData.phoneNumber,
//     email: formData.email,
//     colorLevel: formData.colorLevel as unknown as string,
//     role: formData.role as
//       | "Administrator"
//       | "Animal Behaviourist"
//       | "Staff"
//       | "Volunteer",
//   });
//   await UserAPIClient.invite(formData.email);
// } catch (error) {
//   throw error;
// }
// };

const UserManagementPage = (): React.ReactElement => {
  const [users, setUsers] = useState<User[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState<string>("");
  const handleClearFilters = () => {
    setFilters({});
    setSearch("");
  };

  const handleFilterChange = (selectedFilters: Record<string, string[]>) => {
    setFilters(selectedFilters);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
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

  useEffect(() => { // on load, use this effect of grabbing users? 
    getUsers();
  }, []);

  return (
    <Flex direction="column" gap="2rem">
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
      >
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
      <UserManagementTable
        users={filteredUsers}
        clearFilters={handleClearFilters}
      />
    </Flex>
  );
};

export default UserManagementPage;
