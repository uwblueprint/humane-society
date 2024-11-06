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
import FormModal from "../crud/FormModal";

const UserManagementPage = (): React.ReactElement => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const addUser = async () => {
    try {
      setIsModalOpen(true);
    } catch (error) {
      /* TODO: error handling */
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSendInvite = (formData: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    role: string;
  }) => {
    // eslint-disable-next-line no-console
    console.log(`Invite sent to ${formData.email}`);
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div style={{ textAlign: "center", width: "75%", margin: "0px auto" }}>
      <h1>User Management</h1>
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
        <Button onClick={addUser}>+ Add a User</Button>
        <FormModal
          show={isModalOpen}
          onClose={closeModal}
          handleSendInvite={handleSendInvite}
        />
        <MainPageButton />
      </VStack>
    </div>
  );
};

export default UserManagementPage;
