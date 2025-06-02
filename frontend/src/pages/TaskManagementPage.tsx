import React from "react";
import MainPageButton from "../components/common/MainPageButton";
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
} from "@chakra-ui/react"; // components from chakra


const TaskManagementPage = (): React.ReactElement => {
  return (
    <div style={{ textAlign: "center", width: "25%", margin: "0px auto" }}>
      <h1>Task Management Page</h1>
       <TableContainer>
        <Table variant ="simple">
          <Thead>
          <Tr>
            <Th>First Name</Th>
            <Th>Last Name</Th>
          </Tr>
          </Thead>
        </Table>

      </TableContainer>
      <MainPageButton />
    </div>
  );
};

export default TaskManagementPage;
