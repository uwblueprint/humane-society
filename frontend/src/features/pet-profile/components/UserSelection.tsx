import { Flex, Spinner, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import React from "react";
import ProfilePhoto from "../../../components/common/ProfilePhoto";
import Search from "../../../components/common/Search";
import ColourLevelBadge from "../../../components/common/ColourLevelBadge";
import Pagination from "../../../components/common/Pagination";
import { User } from "../../../types/UserTypes";
import { colorLevelMap } from "../../../types/TaskTypes";

type UserSelectionProps = {
  search: string;
  selectedUser: User | null;
  pagedUsers: User[];
  filteredUsers: User[];
  page: number;
  errorMessage: string | null;
  usersPerPage: number;
  loading: boolean;
  onSearch: (value: string) => void;
  onRowClick: (user: User) => void;
  onPageChange: (page: number) => void;
  onClearSelection: () => void;
};

const UserSelection = ({
  search,
  selectedUser,
  pagedUsers,
  filteredUsers,
  page,
  errorMessage,
  usersPerPage,
  loading,
  onSearch,
  onRowClick,
  onPageChange,
  onClearSelection,
}: UserSelectionProps): React.ReactElement => {
    if (loading) {
        return (
            <Flex justify="center" align="center">
            <Spinner />
            </Flex>
        );
        }

  return (
    <>
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
              onClick={onClearSelection}
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
              onChange={onSearch}
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
                      onClick={() => onRowClick(user)}
                      cursor="pointer"
                      backgroundColor={
                        selectedUser?.id === user.id ? "blue.50" : "white"
                      }
                      borderTop="1px solid"
                      borderBottom="1px solid"
                      borderColor="gray.200"
                      _hover={{
                        backgroundColor:
                          selectedUser?.id === user.id ? "blue.50" : "gray.50",
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
        onChange={(newPage) => onPageChange(newPage)}
        numberOfItems={filteredUsers.length}
        itemsPerPage={usersPerPage}
      />
    </>
  );
};

export default UserSelection;
