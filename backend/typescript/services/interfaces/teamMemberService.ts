import { CreateTeamMemberDTO, TeamMemberDTO } from "../../types";

interface ITeamMemberService {
  /**
   * Get a list of all the team members in the database
   * @returns a TeamMemberDTO with a team member's information
   * @throws Error if team member retrieval fails
   */
  getTeamMembers(): Promise<TeamMemberDTO[]>;

  /**
   * Create a team member
   * @param teamMember the team member to be created
   * @returns a TeamMemberDTO with the created team member's information
   * @throws Error if team member creation fails
   */
  createTeamMember(teamMember: CreateTeamMemberDTO): Promise<TeamMemberDTO>;
}

export default ITeamMemberService;
