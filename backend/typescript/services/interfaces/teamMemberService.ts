import { TeamMemberDTO, CreateTeamMemberDTO } from "../../types";

export interface ITeamMemberService {
  /**
   * Retrieve an array of all Team Members.
   * @returns Promise of an array of Team Member DTOs
   * @throws Error if retrieval fails
   */
  getTeamMembers(): Promise<Array<TeamMemberDTO>>;

  /**
   * Adding the passed in team member to the database
   * @params Team member to create
   * @returns Promise of the created team member
   * @throws Error if retrieval fails
   */
  createTeamMember(teamMember: CreateTeamMemberDTO): Promise<TeamMemberDTO>;
}
