import { TeamMember, TeamRole } from "../types/TeamMembersTypes";
import baseAPIClient from "./BaseAPIClient";

const get = async (): Promise<TeamMember[]> => {
    try {
        const { data } = await baseAPIClient.get("/team-member");
        return data;
    } catch (error) {
        throw new Error(`Failed to get entity: ${error}`);
    }
};

const create = async (
    firstName: string,
    lastName: string,
    teamRole: TeamRole)
    : Promise<TeamMember[]> => {
    try {
        const { data } = await baseAPIClient.post("/team-member", {
            firstName,
            lastName,
            teamRole
        });
        return data;
    } catch (error) {
        throw new Error(`Failed to create entity: ${error}`);
    }
};


export default { create, get };