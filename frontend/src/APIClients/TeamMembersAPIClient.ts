import { TeamMember, TeamRole } from "../types/TeamMembersTypes";
import baseAPIClient from "./BaseAPIClient";

const get = async (): Promise<TeamMember[] | null> => {
  try {
    const { data } = await baseAPIClient.get("team-members/");
    return data;
  } catch (error: unknown) {
    return null;
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
