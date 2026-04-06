import { CheckIcon, WarningTwoIcon } from "@chakra-ui/icons";
import {
  Flex,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import React from "react";
import ProfilePhoto from "../../../components/common/ProfilePhoto";
import SearchTagSelect from "../../../components/common/SearchTagSelect";
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
  hasColorLevelMismatch: boolean;
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
  hasColorLevelMismatch,
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
        <Text color="gray.600" marginBottom="0.38rem" fontWeight="normal">
          Assign to:
        </Text>
        <SearchTagSelect
          search={search}
          onSearchChange={onSearch}
          placeholder="Search for a user..."
          isItemSelected={!!selectedUser}
          selectedText={
            selectedUser
              ? `${selectedUser.firstName} ${selectedUser.lastName}`
              : ""
          }
          selectedIcon={
            selectedUser && (
              <Flex
                width="2.25rem"
                height="2.25rem"
                flexShrink={0}
                borderRadius="full"
                overflow="hidden"
              >
                <ProfilePhoto
                  image={selectedUser.profilePhoto}
                  color={colorLevelMap[selectedUser.colorLevel]}
                  showColorBorder
                  size="x-small"
                  type="user"
                />
              </Flex>
            )
          }
          onClearSelection={onClearSelection}
        />
      </Flex>

      {/* user table */}
      <Flex direction="column" gap="0.5rem">
        <Text color="gray.600">Suggestions:</Text>
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
                    <Td colSpan={3}>
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
                          {selectedUser?.id === user.id &&
                            hasColorLevelMismatch && (
                              <Flex align="center" gap="0.375rem" ml="2rem">
                                <WarningTwoIcon color="red.600" boxSize="1rem" />
                                <Text
                                  m={0}
                                  textStyle="body"
                                  color="red.600"
                                  whiteSpace="nowrap"
                                >
                                  User's colour level is lower than the pet's.
                                </Text>
                              </Flex>
                            )}
                        </Flex>
                      </Td>
                      <Td
                        textAlign="center"
                        width="60px"
                        minWidth="40px"
                        padding="0"
                      >
                        {selectedUser?.id === user.id && (
                          <CheckIcon boxSize="20px" color="blue.700" />
                        )}
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
