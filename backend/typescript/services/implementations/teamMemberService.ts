import PgTeamMember from "../../models/teamMember.model";
import ITeamMemberService from "../interfaces/teamMemberService";
import logger from "../../utilities/logger";
import { TeamMemberDTO, CreateTeamMemberDTO } from "../../types";
import { getErrorMessage } from "../../utilities/errorUtils";

const Logger = logger(__filename);

class TeamMemberService implements ITeamMemberService {
    private teamMembers: TeamMemberDTO[] = [];
    async getTeamMembers(): Promise<TeamMemberDTO[]> {
        try {
            const teamMembers: Array<PgTeamMember> = await PgTeamMember.findAll();
            return teamMembers.map((teamMember) => ({
                id: teamMember.id,
                firstName: teamMember.firstName,
                lastName: teamMember.lastName,
                teamRole: teamMember.teamRole,
            }));
        } catch (error: unknown) {
            Logger.error(
              `Failed to retrieve team members. Reason = ${getErrorMessage(error)}`,
            );
            throw error;
        }
    }

    async createTeamMember(teamMember: CreateTeamMemberDTO): Promise<TeamMemberDTO> {
        let newTeamMember: PgTeamMember | null;
        try {
            newTeamMember = await PgTeamMember.create({
                firstName: teamMember.firstName,
                lastName: teamMember.lastName,
                teamRole: teamMember.teamRole,
            });
        } 
        catch (error: unknown) {
            Logger.error(
                `Failed to retrieve team members. Reason = ${getErrorMessage(error)}`,
              );
        throw new Error("Failed to create team member");
        }
        return {
            id: newTeamMember.id,
            firstName: newTeamMember.firstName,
            lastName: newTeamMember.lastName,
            teamRole: newTeamMember.teamRole,
        }
    }
}

export default TeamMemberService;