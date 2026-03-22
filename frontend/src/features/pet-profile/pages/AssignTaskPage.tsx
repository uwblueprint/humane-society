/* eslint  react/jsx-props-no-spreading: 0 */ // --> OFF
import React, { useEffect, useState, useMemo } from "react";
import { useHistory } from "react-router-dom";
import { Flex, Text } from "@chakra-ui/react";
import { ChevronRightIcon, ChevronLeftIcon } from "@chakra-ui/icons";
import NavBar from "../../../components/common/navbar/NavBar";
import PetProfileSidebar from "../components/PetProfileSidebar";
import Button from "../../../components/common/Button";
import UserAPIClient from "../../../APIClients/UserAPIClient";
import { User } from "../../../types/UserTypes";
import { ColorLevel } from "../../../types/TaskTypes";

import { PetStatus, SexEnum } from "../../../types/PetTypes";
import UserSelection from "../components/UserSelection";

// sample prop fro PetProfilePage for testing
const sampleProp = {
  id: 1,
  name: "Benji",
  status: PetStatus.NEEDS_CARE,
  colorLevel: ColorLevel.YELLOW,
  breed: "Siberian Husky",
  birthday: "2025-07-27",
  weightKg: 25.5,
  spayedNeutered: true,
  sex: SexEnum.MALE,
  photo: "/images/dog2.png",
  petCare: {
    safetyInfo: "safety info",
    managementInfo: "management info",
    medicalInfo: "medical",
  },
};

const AssignTaskPage = (): React.ReactElement => {
  const history = useHistory();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    history.goBack();
  };

  return (
    <>
      <NavBar pageName="Pet Profile" />
      <Flex flex="1">
        <PetProfileSidebar {...sampleProp} />

        {/* main content */}
        <Flex
          direction="column"
          flex="1"
          backgroundColor="gray.50"
          paddingTop="8.5rem"
          paddingInline="2.5rem"
          gap="1.5rem"
        >
          {/* back to pet profile */}
          <Flex
            align="center"
            gap="0.25rem"
            cursor="pointer"
            onClick={handleBackClick}
            width="fit-content"
          >
            <ChevronLeftIcon />
            <Text m={0} textStyle="body">
              Back to Pet Profile
            </Text>
          </Flex>

          {/* title */}
          <Text m={0} textStyle="h1">
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
          />

          {/* save/next button */}
          <Flex justify="flex-end">
            <Button
              variant={selectedUser ? "green" : "gray"}
              rightIcon={<ChevronRightIcon />}
            >
              {selectedUser ? "Save" : "Next"}
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};

export default AssignTaskPage;
