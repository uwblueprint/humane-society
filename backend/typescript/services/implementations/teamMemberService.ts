import { TeamMemberDTO, CreateTeamMemberDTO } from "../../types";
import PgTeamMember from "../../models/teamMember.model";
import logger from "../../utilities/logger";
import { ITeamMemberService } from "../interfaces/teamMemberService";

const Logger = logger(__filename);

class TeamMemberService implements ITeamMemberService {
    async getTeamMembers(): Promise<Array<TeamMemberDTO>> {
        let teamMembers: Array<PgTeamMember> = [];

        try {
        teamMembers = await PgTeamMember.findAll({
            attributes: ['id', 'first_name', 'last_name', 'team_role'],
        });
        } catch (error) {
            Logger.error(`Failed to get team members. Reason = ${getErrorMessage(error)}`);
            throw error;
        }

        let teamMemberDTOs: Array<TeamMemberDTO> = [];

        for (const teamMember of teamMembers) {
            teamMemberDTOs.push({
                id: teamMember.id,
                firstName: teamMember.first_name,
                lastName: teamMember.last_name,
                teamRole: teamMember.team_role,
            });
        }

        return teamMemberDTOs;
    }

    async createTeamMember(teamMember: CreateTeamMemberDTO): Promise<TeamMemberDTO> {
        let newTeamMember: PgTeamMember | null;

        try {
            newTeamMember = await PgTeamMember.create({
                first_name: teamMember.firstName,
                last_name: teamMember.lastName,
                team_role: teamMember.teamRole,
            });
        } catch (error) {
            Logger.error(`Failed to create team member. Reason = ${getErrorMessage(error)}`);
            throw error;
        }

        return {
            id: newTeamMember.id,
            firstName: newTeamMember.first_name,
            lastName: newTeamMember.last_name,
            teamRole: newTeamMember.team_role,
        };
    }
}

export default TeamMemberService;