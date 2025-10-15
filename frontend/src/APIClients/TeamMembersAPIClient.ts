import { TeamMember, TeamRole } from "../types/TeamMembersTypes";
import baseAPIClient from "./BaseAPIClient";

// Fetch all team members
const get = async (): Promise<TeamMember[] | null> => {
  try {
    const { data } = await baseAPIClient.get("team-members/");
    return data;
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error fetching team members:", error);
    return null;
  }
};

// Add a new team member
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
    // eslint-disable-next-line no-console
    console.error("Error creating team member:", error);
    return null;
  }
};

export default { get, create };
