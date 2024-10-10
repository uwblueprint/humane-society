import PgTeamMember from "../../models/teamMember.model";
import { CreateTeamMemberDTO, TeamMemberDTO } from "../../types";
import { getErrorMessage, NotFoundError } from "../../utilities/errorUtils";
import logger from "../../utilities/logger";
import ITeamMemberService from "../interfaces/teamMemberService";

const Logger = logger(__filename);

class TeamMemberService implements ITeamMemberService {
  /* eslint-disable class-methods-use-this */

  async getTeamMembers(): Promise<TeamMemberDTO[]> {
    try {
      const teamMembers: Array<PgTeamMember> = await PgTeamMember.findAll();
      return teamMembers.map((teamMember) => ({
        id: String(teamMember.id),
        firstName: teamMember.first_name,
        lastName: teamMember.last_name,
        teamRole: teamMember.team_role,
      }));
    } catch (error: unknown) {
      Logger.error(
        `Failed to get team members. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  async createTeamMember(
    teamMember: CreateTeamMemberDTO,
  ): Promise<TeamMemberDTO> {
    let newTeamMember: PgTeamMember | null;
    try {
      newTeamMember = await PgTeamMember.create({
        first_name: teamMember.firstName,
        last_name: teamMember.lastName,
        team_role: teamMember.teamRole,
      });
    } catch (error: unknown) {
      Logger.error(
        `Failed to create team member. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
    return {
      id: String(newTeamMember.id),
      firstName: newTeamMember.first_name,
      lastName: newTeamMember.last_name,
      teamRole: newTeamMember.team_role,
    };
  }
}

export default TeamMemberService;
