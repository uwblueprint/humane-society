import React from "react";
import { Table, Thead, Tr, Th, Td, Tbody, Text } from "@chakra-ui/react";
import { TableEmptyState } from "../../../components/common/table";
import UserListTableSection from "./UserManagementTableSection";
import { User } from "../../../types/UserTypes";

interface UserManagementTableProps {
  users: User[];
  clearFilters: () => void;
}

const UserManagementTable = ({
  users,
  clearFilters,
}: UserManagementTableProps): React.ReactElement => {
  return (
    <Table w="100%" textAlign="left">
      <Thead borderBottom="1px solid" borderColor="gray.200">
        <Tr borderTop="1px solid" borderColor="gray.200">
          <Th py="1rem" px="2.5rem">
            <Text color="gray.800" textStyle="subheading" m={0}>
              NAME
            </Text>
          </Th>
          <Th py="1rem" px="0">
            <Text color="gray.800" textStyle="subheading" m={0}>
              ROLE
            </Text>
          </Th>
          <Th py="1rem" pr="2.5rem" pl="0">
            <Text color="gray.800" textStyle="subheading" m={0}>
              ANIMAL TAG
            </Text>
          </Th>
        </Tr>
      </Thead>

      {users.length === 0 ? (
        <Tbody>
          <Tr>
            <Td colSpan={3}>
              <TableEmptyState
                message="No users currently match."
                onClearFilters={clearFilters}
              />
            </Td>
          </Tr>
        </Tbody>
      ) : (
        <UserListTableSection users={users} />
      )}
    </Table>
  );
};

export default UserManagementTable;
