import { TeamMemberDTO, CreateTeamMemberDTO } from "../../types";
import TeamMember from "../../models/teamMember.model";
import logger from "../../utilities/logger";
import { getErrorMessage } from "../../utilities/errorUtils";
import { ITeamMemberService } from "../interfaces/teamMemberService";

// Node.js does not set __filename globally in ES modules, 
// so we can use module.filename or a string fallback.
const Logger = logger(module?.filename ?? "teamMemberService.ts");

class TeamMemberService implements ITeamMemberService {
    async getTeamMembers(): Promise<Array<TeamMemberDTO>> {
        let teamMembers: Array<TeamMember> = [];

        try {
            teamMembers = await TeamMember.findAll({
                attributes: ['id', 'firstName', 'lastName', 'teamRole'],
            });
        } catch (error) {
            Logger.error(`Failed to get team members. Reason = ${getErrorMessage(error)}`);
            throw error;
        }

        const teamMemberDTOs: Array<TeamMemberDTO> = teamMembers.map((teamMember) => ({
            id: teamMember.id,
            firstName: teamMember.firstName,
            lastName: teamMember.lastName,
            teamRole: teamMember.teamRole,
        }));

        return teamMemberDTOs;
    }

    async createTeamMember(teamMember: CreateTeamMemberDTO): Promise<TeamMemberDTO> {
        let newTeamMember: TeamMember;

        try {
            newTeamMember = await TeamMember.create({
                firstName: teamMember.firstName,
                lastName: teamMember.lastName,
                teamRole: teamMember.teamRole,
            });
        } catch (error) {
            Logger.error(`Failed to create team member. Reason = ${getErrorMessage(error)}`);
            throw error;
        }

        return {
            id: newTeamMember.id,
            firstName: newTeamMember.firstName,
            lastName: newTeamMember.lastName,
            teamRole: newTeamMember.teamRole,
        };
    }
}

export default TeamMemberService;