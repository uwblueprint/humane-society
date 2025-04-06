import React, { useEffect, useMemo, useState } from "react";
import {
  // Table,
  // Thead,
  // Tbody,
  // Tr,
  // Th,
  // Td,
  // TableContainer,
  // VStack,
  // Button,
  Alert,
  AlertIcon,
  CloseButton,
  Flex,
} from "@chakra-ui/react";
import UserAPIClient from "../APIClients/UserAPIClient";
import { User, AnimalTag } from "../types/UserTypes";
// import AddUserFormModal, {
//   AddUserRequest,
// } from "../components/crud/AddUserFormModal";
import UserManagementTable from "../components/common/user-management/UserManagementTable";
import Filter from "../components/common/Filter";
import Search from "../components/common/Search";

// const handleUserSubmit = async (formData: AddUserRequest) => {
// eslint-disable-next-line no-useless-catch
// try {
//   await UserAPIClient.create({
//     firstName: formData.firstName,
//     lastName: formData.lastName,
//     phoneNumber: formData.phoneNumber,
//     email: formData.email,
//     colorLevel: formData.colorLevel as unknown as string,
//     role: formData.role as
//       | "Administrator"
//       | "Animal Behaviourist"
//       | "Staff"
//       | "Volunteer",
//   });
//   await UserAPIClient.invite(formData.email);
// } catch (error) {
//   throw error;
// }
// };

const UserManagementPage = (): React.ReactElement => {
  const [users, setUsers] = useState<User[]>([]);
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState<string>("");

  const handleClearFilters = () => {
    setFilters({});
    setSearch("");
  };

  const handleFilterChange = (selectedFilters: Record<string, string[]>) => {
    setFilters(selectedFilters);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const filteredUsers = useMemo(() => {
    return users
      .filter((prev) => {
        return Object.keys(filters).every((key) => {
          const filterVals = filters[key as keyof typeof filters];
          if (!filterVals?.length) return true;

          const value = prev[key as keyof User];

          if (value == null) return false;

          if (Array.isArray(value)) {
            return filterVals.some((f) => value.includes(f as AnimalTag));
          }

          return filterVals.includes(String(value));
        });
      })
      .filter((prev) => {
        return prev.name?.toLowerCase().includes(search.toLowerCase());
      });
  }, [filters, search, users]);

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

  // const addUser = () => {
  //   setIsModalOpen(true);
  // };

  // const closeModal = () => {
  //   setIsModalOpen(false);
  // };

  // const refreshUserManagementTable = async () => {
  //   await getUsers();
  // };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <Flex direction="column" gap="2rem">
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
      <Flex
        padding="0 2.5rem"
        maxWidth="100vw"
        justifyContent="space-between"
        gap="1rem"
      >
        <Filter
          type="userManagement"
          onChange={handleFilterChange}
          selected={filters}
        />
        <Search
          placeholder="Search for a user..."
          onChange={handleSearchChange}
          search={search}
        />
      </Flex>
      <UserManagementTable
        users={filteredUsers}
        clearFilters={handleClearFilters}
      />
    </Flex>
    // <div>
    //   <UserManagementTable
    //     users={filteredUsers}
    //     clearFilters={handleClearFilters}
    //   />
    //   <VStack spacing="24px" style={{ margin: "24px auto" }}>
    //     {successMessage && (
    //       <Alert status="success" mb={4}>
    //         <AlertIcon />
    //         {successMessage}
    //         <CloseButton
    //           position="absolute"
    //           right="8px"
    //           top="8px"
    //           onClick={() => setSuccessMessage(null)}
    //         />
    //       </Alert>
    //     )}
    //     {errorMessage && (
    //       <Alert status="error" mb={4}>
    //         <AlertIcon />
    //         {errorMessage}
    //         <CloseButton
    //           position="absolute"
    //           right="8px"
    //           top="8px"
    //           onClick={() => setErrorMessage(null)}
    //         />
    //       </Alert>
    //     )}
    //     {/* <TableContainer>
    //       <Table variant="simple">
    //         <Thead>
    //           <Tr>
    //             <Th>First Name</Th>
    //             <Th>Last Name</Th>
    //             <Th>Email</Th>
    //             <Th>Role</Th>
    //             <Th>Status</Th>
    //           </Tr>
    //         </Thead>
    //         <Tbody>
    //           {users.map((user) => (
    //             <Tr key={user.id}>
    //               <Td>{user.firstName}</Td>
    //               <Td>{user.lastName}</Td>
    //               <Td>{user.email}</Td>
    //               <Td>{user.role}</Td>
    //               <Td>{user.status}</Td>
    //               <Td>{user.colorLevel}</Td>
    //             </Tr>
    //           ))}
    //         </Tbody>
    //       </Table>
    //     </TableContainer> */}
    //     {/* <Button
    //       onClick={() => {
    //         return null;
    //       }}
    //     >
    //       + Add a User
    //     </Button> */}
    //     {/* {isModalOpen && (
    //       <AddUserFormModal
    //         onSubmit={async (formData) => {
    //           // Clear previous messages
    //           setSuccessMessage(null);
    //           setErrorMessage(null);
    //           try {
    //             await handleUserSubmit(formData);
    //             setSuccessMessage("Invite Sent! ✔️");
    //             closeModal();
    //             refreshUserManagementTable();
    //             // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //           } catch (error: any) {
    //             // Customize error message based on backend response
    //             if (
    //               error.response &&
    //               error.response.data &&
    //               error.response.data.message
    //             ) {
    //               setErrorMessage(error.response.data.message);
    //             } else {
    //               setErrorMessage(
    //                 "An error occurred while sending the invite.",
    //               );
    //             }
    //           }
    //         }}
    //       />
    //     )} */}
    //   </VStack>
    // </div>
  );
};

export default UserManagementPage;
