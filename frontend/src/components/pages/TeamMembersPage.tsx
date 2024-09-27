import React, { useEffect, useState } from "react";
import {
  Table, Text, Thead, Input, Tbody, Tr, Th, Td, TableContainer, VStack, Button
} from "@chakra-ui/react";
import TeamMembersAPIClient from "../../APIClients/TeamMembersAPIClient";
import { TeamMember } from "../../types/TeamMembersTypes";

const TeamMembersPage = (): React.ReactElement => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const getTeamMembers = async () => {
    try {
      const teamMember = await TeamMembersAPIClient.get();
      if (teamMember != null) {
        setTeamMembers(teamMember);
      }
    } catch (error) {
      console.error();
    }
  };

  const addTeamMembers = async (firstName: string, lastName: string) => {
    try {
      await TeamMembersAPIClient.create(firstName, lastName, "DEVELOPER");
      await TeamMembersAPIClient.get();
      await getTeamMembers();
    } catch (error) {
      console.error();
    }
  };

  useEffect(() => {
    getTeamMembers();
  }, []);

  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => setFirstName(event.target.value)
  const handleLastName = (event: React.ChangeEvent<HTMLInputElement>) => setLastName(event.target.value)

  return (
    <div style={{ textAlign: "center", width: "25%", margin: "0px auto" }}>
      <h1>Team Members</h1>
      <VStack spacing="24px" style={{ margin: "24px auto" }}>
        <Text fontSize='md'> Set a first and last name of a bot to add to the table: </Text>
        <Input
          value={firstName}
          onChange={handleChange}
          placeholder='Enter a first name here'
          size='sm'
        />
        <Input
          value={lastName}
          onChange={handleLastName}
          placeholder='Enter a last name here'
          size='sm'
        />
        <Button onClick={() => addTeamMembers(firstName, lastName)}>Add Team Member</Button>
        <TableContainer>
          <Table>
            <Thead>
              <Tr>
                <Th>First Name</Th>
                <Th>Last Name</Th>
                <Th>Team Role</Th>
              </Tr>
            </Thead>
            <Tbody>
              {teamMembers.map((teamMember: TeamMember) => (
                <Tr key={teamMember.id}>
                  <Td>{teamMember.firstName}</Td>
                  <Td>{teamMember.lastName}</Td>
                  <Td>{teamMember.teamRole}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </VStack>
    </div>
  );
};

export default TeamMembersPage;
