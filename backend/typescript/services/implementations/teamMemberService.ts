// need interface + implementation
// interface = what functions, implementation = how they work
import PgTeamMember from "../../models/teamMember.model"; //Pg = Postgres TeamMember
import ITeamMemberService from "../interfaces/ITeamMemberService"; 
import { TeamMemberDTO, CreateTeamMemberDTO } from "../../types";
import {getErrorMessage } from "../../utilities/errorUtils";
import logger from "../../utilities/logger";

const Logger = logger(__filename);
// getTeamMembers() and createTeamMember()
class TeamMemberService implements ITeamMemberService {
    async getTeamMembers(): Promise<TeamMemberDTO[]> {
        try {
          // Query the database for all rows in team_members table 
          const teamMembers: Array<PgTeamMember> = await PgTeamMember.findAll();
          return teamMembers.map((teamMember) => ({
            id: String(teamMember.id),
            firstName: teamMember.first_name,
            lastName: teamMember.last_name,
            teamRole: teamMember.team_role,
          }));   
        } catch (error: unknown) {
            Logger.error(
                `Failed to get team members. ${getErrorMessage(error)}`,
            );
            throw error;
        }
    }

    //create a new team member record in database
    // takes a createTeamMemberDTO(omit id)
    async createTeamMember(
        teamMember: CreateTeamMemberDTO,
    ): Promise<TeamMemberDTO> {
      // will store new row returned by sequalize
      let newTeamMember: PgTeamMember | null;
      try {
        // insert new member into db table using sequelize create 
        newTeamMember = await PgTeamMember.create({
            first_name: teamMember.firstName,
            last_name: teamMember.lastName,
            team_role: teamMember.teamRole,
        });
      } catch (error: unknown) {
            Logger.error(
                `Failed to get team members. ${getErrorMessage(error)}`,
            );
            throw error;
      } // return new team member as a DTO (formatted for frontend)
      return {
        id: String(newTeamMember.id),
        firstName: newTeamMember.first_name,
        lastName: newTeamMember.last_name,
        teamRole: newTeamMember.team_role,
    };
  }
}

export default TeamMemberService;