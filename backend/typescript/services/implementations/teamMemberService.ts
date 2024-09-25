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
                firstName: teamMember.first_name,
                lastName: teamMember.last_name,
                teamRole: teamMember.team_role,
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
                first_name: teamMember.firstName,
                last_name: teamMember.lastName,
                team_role: teamMember.teamRole,
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
            firstName: newTeamMember.first_name,
            lastName: newTeamMember.last_name,
            teamRole: newTeamMember.team_role,
        }
    }
}

export default TeamMemberService;