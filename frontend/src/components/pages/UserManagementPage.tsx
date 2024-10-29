import React, { useEffect, useState } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  VStack,
  Button,
} from "@chakra-ui/react";
import UserAPIClient from "../../APIClients/UserAPIClient";
import { User } from "../../types/UserTypes";
import MainPageButton from "../common/MainPageButton";

const UserManagementPage = (): React.ReactElement => {
  const [users, setUsers] = useState<User[]>([]);

  const getUsers = async () => {
    try {
      const fetchedUsers = await UserAPIClient.get();
      if (fetchedUsers != null) {
        setUsers(fetchedUsers);
      }
    } catch (error) {
      /* TODO: error handling */
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div style={{ textAlign: "center", width: "75%", margin: "0px auto" }}>
      <h1>User Management Page</h1>
      <VStack spacing="24px" style={{ margin: "24px auto" }}>
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>First Name</Th>
                <Th>Last Name</Th>
                <Th>Role</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((user) => (
                <Tr key={user.id}>
                  <Td>{user.firstName}</Td>
                  <Td>{user.lastName}</Td>
                  <Td>{user.role}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
        <Button onClick={getUsers}>Refresh</Button>
        <MainPageButton />
      </VStack>
    </div>
  );
};

export default UserManagementPage;