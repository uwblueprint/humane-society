import React, { useEffect, useState } from "react";
import {
    Table, Thead, Tbody, Tr, Th, Td, TableContainer, VStack,Button} from "@chakra-ui/react";
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

const addTeamMembers = async () => {
    try {
        await TeamMembersAPIClient.create("Justin", "Lau", "DEVELOPER");
        await TeamMembersAPIClient.get();
    } catch (error) {
        console.error();
    }
};

    useEffect(() => {
    getTeamMembers();
  }, []);

  return (
    <div style={{ textAlign: "center", width: "25%", margin: "0px auto" }}>
        <h1>Team Members</h1>
      <VStack spacing="24px" style={{ margin: "24px auto" }}>
        <Button onClick={addTeamMembers}>Add Team Member</Button>
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
