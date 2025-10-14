import { CreateTeamMember, TeamMember } from "../types/TeamMemberTypes";
import baseAPIClient from "./BaseAPIClient";

const getTeamMembers = async (): Promise<Array<TeamMember>> => {
  try {
    const { data } = await baseAPIClient.get("/team-members");
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch team members: ${error}`);
  }
};

const createTeamMember = async (
  teamMember: CreateTeamMember,
): Promise<TeamMember> => {
  try {
    const { data } = await baseAPIClient.post("/team-members", teamMember);
    return data;
  } catch (error) {
    throw new Error(`Failed to create team member: ${error}`);
  }
};

export default { getTeamMembers, createTeamMember };
