import { TeamMember, TeamRole } from "../types/TeamMemberTypes";
import baseAPIClient from "./BaseAPIClient";

const get = async (): Promise<TeamMember[]> => {
  try {
    const { data } = await baseAPIClient.get("team-members/");
    return data;
  } catch (error) {
    throw new Error(`Failed to get team members: ${error}`);
  }
};

const create = async (
  firstName: string,
  lastName: string,
  teamRole: TeamRole,
): Promise<TeamMember[] | null> => {
  try {
    const { data } = await baseAPIClient.post("team-members/", {
      firstName,
      lastName,
      teamRole,
    });
    return data;
  } catch (error: unknown) {
    return null;
  }
};

export default { get, create };
