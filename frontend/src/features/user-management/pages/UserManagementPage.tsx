import React, { useEffect, useMemo, useState } from "react";
import UserAPIClient from "../../../APIClients/UserAPIClient";
import { User } from "../../../types/UserTypes";

import { TableWrapper } from "../../../components/common/table";
import UserManagementTable from "../components/UserManagementTable";

import Pagination from "../../../components/common/Pagination";

const UserManagementPage = (): React.ReactElement => {
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

  return (
    <TableWrapper
      filterBarProps={{
        filterType: "userManagement",
        filters,
        onFilterChange: handleFilterChange,
        search,
        onSearchChange: handleSearchChange,
        searchPlaceholder: "Search for a user...",
      }}
      errorMessage={errorMessage}
      onDismissError={() => setErrorMessage(null)}
      bottomContent={
        <Pagination
          value={page}
          onChange={(newPage) => setPage(newPage)}
          numberOfItems={filteredUsersLength}
          itemsPerPage={numUsersPerPage}
        />
      }
    >
      <UserManagementTable
        users={filteredUsers.slice(
          (page - 1) * numUsersPerPage,
          page * numUsersPerPage,
        )}
        clearFilters={handleClearFilters}
      />
    </TableWrapper>
  );
};

export default UserManagementPage;
