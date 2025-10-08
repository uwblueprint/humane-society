import { TeamMember, TeamRole } from "../types/TeamMemberTypes";
import baseAPIClient from "./BaseAPIClient";

const get = async (): Promise<TeamMember[] | null> => {
  try {
    console.log("Making GET request to team-members/");
    const { data } = await baseAPIClient.get("team-members/");
    console.log("GET response data:", data);
    return data;
  } catch (error: unknown) {
    console.error("GET request failed:", error);
    return null;
  }
};

const create = async (
  firstName: string,
  lastName: string,
  teamRole: TeamRole,
): Promise<TeamMember[] | null> => {
  try {
    console.log("Making POST request to team-members/ with data:", { firstName, lastName, teamRole });
    const { data } = await baseAPIClient.post("team-members/", {
      firstName,
      lastName,
      teamRole,
    });
    console.log("POST response data:", data);
    return data;
  } catch (error: unknown) {
    console.error("POST request failed:", error);
    return null;
  }
};

export default { get, create };