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
  Alert,
  AlertIcon,
  CloseButton,
} from "@chakra-ui/react";
import UserAPIClient from "../APIClients/UserAPIClient";
import { User } from "../types/UserTypes";
import MainPageButton from "../components/common/MainPageButton";
import AddUserFormModal, {
  AddUserRequest,
} from "../components/crud/AddUserFormModal";

const handleUserSubmit = async (formData: AddUserRequest) => {
  // eslint-disable-next-line no-useless-catch
  try {
    await UserAPIClient.create({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      colorLevel: formData.colorLevel, // Add this line
      role: formData.role as
        | "Administrator"
        | "Animal Behaviourist"
        | "Staff"
        | "Volunteer",
    });
    await UserAPIClient.invite(formData.email);
  } catch (error) {
    throw error;
  }
};

const UserManagementPage = (): React.ReactElement => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const addUser = () => {
    setIsModalOpen(true);
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
        {successMessage && (
          <Alert status="success" mb={4}>
            <AlertIcon />
            {successMessage}
            <CloseButton
              position="absolute"
              right="8px"
              top="8px"
              onClick={() => setSuccessMessage(null)}
            />
          </Alert>
        )}
        {errorMessage && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            {errorMessage}
            <CloseButton
              position="absolute"
              right="8px"
              top="8px"
              onClick={() => setErrorMessage(null)}
            />
          </Alert>
        )}
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>First Name</Th>
                <Th>Last Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((user) => (
                <Tr key={user.id}>
                  <Td>{user.firstName}</Td>
                  <Td>{user.lastName}</Td>
                  <Td>{user.email}</Td>
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
            onSubmit={async (formData) => {
              // Clear previous messages
              setSuccessMessage(null);
              setErrorMessage(null);
              try {
                await handleUserSubmit(formData);
                setSuccessMessage("Invite Sent! ✔️");
                closeModal();
                refreshUserManagementTable();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } catch (error: any) {
                // Customize error message based on backend response
                if (
                  error.response &&
                  error.response.data &&
                  error.response.data.message
                ) {
                  setErrorMessage(error.response.data.message);
                } else {
                  setErrorMessage(
                    "An error occurred while sending the invite.",
                  );
                }
              }
            }}
          />
        )}
        <MainPageButton />
      </VStack>
    </div>
  );
};

export default UserManagementPage;
