import React, { useEffect, useMemo, useState } from "react";
import { Flex, Text, useToast } from "@chakra-ui/react";
import UserSelection from "../UserSelection";
import UserAPIClient from "../../../../APIClients/UserAPIClient";
import { User } from "../../../../../src/types/UserTypes";
import { AlertCircleIcon } from "../../../../assets/icons";

interface AddTaskForm3Props {
  petColorLevel: number;
  selectedUser: User | null;
  onSelectUser: (user: User | null) => void;
}

const AddTaskForm3 = ({
  petColorLevel,
}: AddTaskForm3Props): React.ReactElement => {
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const usersPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const fetchedUsers = await UserAPIClient.get();
        if (fetchedUsers != null) setUsers(fetchedUsers);
      } catch (error) {
        setErrorMessage(`${error}`);
        toast({
          title: "Error fetching users",
          description: `${error}`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [toast]);

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

  const hasColorLevelMismatch =
    selectedUser !== null && selectedUser.colorLevel < petColorLevel;

	const handleSearch = (value: string) => {
		setSelectedUser(null);
		setSearch(value);
		setPage(1);
	}

	const handleRowClick = (user: User) => {
		setSelectedUser(user);
	}

	// CHECKIN: prob don't need this??
	const handleClearSelection = () => {
		setSelectedUser(null);
		setSearch("");
	}

  return (
		<Flex flexDirection="column" gap="1.5rem">
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
			/>

			{hasColorLevelMismatch && (
				// AlertCircleIcon
				<Text m={0} color="red.600" textStyle="body">
					User's colour level is lower than the pet's.
				</Text>
			)}
		</Flex>
	);
};

export default AddTaskForm3;
