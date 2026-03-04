/* eslint  react/jsx-props-no-spreading: 0 */ // --> OFF
import React, { useEffect, useState, useMemo } from "react";
import { useHistory } from "react-router-dom";
import {
  Flex,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
} from "@chakra-ui/react";
import { ChevronRightIcon, ChevronLeftIcon } from "@chakra-ui/icons";
import NavBar from "../../../components/common/navbar/NavBar";
import PetProfileSidebar from "../components/PetProfileSidebar";
import Button from "../../../components/common/Button";
import Search from "../../../components/common/Search";
import Pagination from "../../../components/common/Pagination";
import ProfilePhoto from "../../../components/common/ProfilePhoto";
import UserAPIClient from "../../../APIClients/UserAPIClient";
import { User } from "../../../types/UserTypes";
import { colorLevelMap, ColorLevel } from "../../../types/TaskTypes";
import ColourLevelBadge from "../../../components/common/ColourLevelBadge";

import { PetStatus, SexEnum } from "../../../types/PetTypes";

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

  const handleBackClick = () => {
    history.goBack();
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner />
      </Flex>
    );
  }

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

          {/* assign to label & search */}
          <Flex direction="column" gap="0.5rem">
            <Text m={0} textStyle="body">
              Assign to:
            </Text>
            {selectedUser ? (
              <Flex
                align="center"
                padding="0.5rem 0.75rem"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="0.375rem"
                backgroundColor="white"
                width="100%"
                height="2.5rem"
                overflow="hidden"
              >
                {/* fill search bar when selected */}
                <Flex
                  align="center"
                  gap="0.5rem"
                  padding="0.25rem 0.5rem"
                  borderRadius="full"
                  backgroundColor="blue.50"
                  cursor="pointer"
                  onClick={() => {
                    setSelectedUser(null);
                    setSearch("");
                  }}
                >
                  <Flex
                    width="1.5rem"
                    height="1.5rem"
                    flexShrink={0}
                    borderRadius="full"
                    overflow="hidden"
                    sx={{
                      "> *": {
                        width: "1.5rem !important",
                        height: "1.5rem !important",
                      },
                      img: {
                        width: "1.25rem !important",
                        height: "1.25rem !important",
                      },
                      div: { borderRadius: "50% !important" },
                    }}
                  >
                    <ProfilePhoto
                      image={selectedUser.profilePhoto}
                      color={colorLevelMap[selectedUser.colorLevel]}
                      showColorBorder
                      size="small"
                      type="user"
                    />
                  </Flex>
                  <Text m={0} textStyle="body">
                    {`${selectedUser.firstName} ${selectedUser.lastName}`}
                  </Text>
                </Flex>
              </Flex>
            ) : (
              <Flex
                backgroundColor="white"
                width="100%"
                sx={{ "> div": { maxWidth: "100%", width: "100%" } }}
              >
                <Search
                  search={search}
                  onChange={handleSearch}
                  placeholder="Search for a user..."
                />
              </Flex>
            )}
          </Flex>

          {/* user table */}
          <Flex direction="column" gap="0.5rem">
            <Text m={0} textStyle="body">
              Suggestions:
            </Text>
            {errorMessage ? (
              <Text m={0} color="red.500">
                {errorMessage}
              </Text>
            ) : (
              <>
                <Table w="100%">
                  <Thead borderBottom="1px solid" borderColor="gray.200">
                    <Tr>
                      <Th>
                        <Text m={0} textStyle="subheading">
                          NAME
                        </Text>
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {pagedUsers.length === 0 ? (
                      <Tr>
                        <Td colSpan={2}>
                          <Text m={0}>No users found.</Text>
                        </Td>
                      </Tr>
                    ) : (
                      pagedUsers.map((user) => (
                        <Tr
                          key={user.id}
                          onClick={() => handleRowClick(user)}
                          cursor="pointer"
                          backgroundColor={
                            selectedUser?.id === user.id ? "blue.50" : "white"
                          }
                          borderTop="1px solid"
                          borderBottom="1px solid"
                          borderColor="gray.200"
                          _hover={{
                            backgroundColor:
                              selectedUser?.id === user.id
                                ? "blue.50"
                                : "gray.50",
                          }}
                        >
                          <Td py="0.5rem">
                            <Flex gap="1rem" align="center">
                              <ProfilePhoto
                                image={user.profilePhoto}
                                color={colorLevelMap[user.colorLevel || 1]}
                                size="small"
                                type="user"
                              />
                              <Text m={0} textStyle="body">
                                {`${user.firstName} ${user.lastName}`}
                              </Text>
                            </Flex>
                          </Td>
                          <Td py="0.5rem" width="50%">
                            <Flex
                              sx={{
                                "> div": {
                                  borderWidth: "0",
                                  backgroundColor:
                                    selectedUser?.id === user.id
                                      ? "blue.50"
                                      : "white",
                                },
                              }}
                            >
                              <ColourLevelBadge
                                colourLevel={colorLevelMap[user.colorLevel]}
                                size="small"
                              />
                            </Flex>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </>
            )}
          </Flex>

          {/* pagination */}
          <Pagination
            value={page}
            onChange={(newPage) => setPage(newPage)}
            numberOfItems={filteredUsers.length}
            itemsPerPage={usersPerPage}
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
