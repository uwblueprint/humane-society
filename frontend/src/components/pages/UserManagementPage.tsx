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
import AddUserFormModal, { AddUserRequest } from "../crud/AddUserFormModal";

const handleUserSubmit = async (formData: AddUserRequest) => {
  await UserAPIClient.create({
    firstName: formData.firstName,
    lastName: formData.lastName,
    phoneNumber: formData.phoneNumber,
    email: formData.email,
    role: formData.role as
      | "Administrator"
      | "Animal Behaviourist"
      | "Staff"
      | "Volunteer",
  });
};

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
      throw new Error(`Failed to get users: ${error}`);
    }
  };

  const addUser = async () => {
    try {
      setIsModalOpen(true);
    } catch (error) {
      throw new Error(`Failed to add user: ${error}`);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const refreshUserManagementTable = async () => {
    await getUsers();
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
                  <Td>{user.status}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
        <Button onClick={addUser}>+ Add a User</Button>
        {isModalOpen && (
          <AddUserFormModal
            onSubmit={(formData) => {
              const completeFormData: AddUserRequest = {
                ...formData,
              };
              return handleUserSubmit(completeFormData).then(() => {
                closeModal();
                refreshUserManagementTable();
              });
            }}
          />
        )}
        <MainPageButton />
      </VStack>
    </div>
  );
};

export default UserManagementPage;
