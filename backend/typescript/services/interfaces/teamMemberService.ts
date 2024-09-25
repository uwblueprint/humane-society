import { TeamMemberDTO, CreateTeamMemberDTO } from "../../types";
      
interface ITeamMemberService {
    /**
     * retrieve all team members in the array
     * @returns all team members
     * @throws Error if retrieval fails
     */
    getTeamMembers(): Promise<TeamMemberDTO[]>;

    /**
     * retrieve the team member with the given id
     * @param teamMember team member id
     * @returns created team member
     * @throws Error if retrieval fails
     */
    createTeamMember(teamMember: CreateTeamMemberDTO): Promise<TeamMemberDTO>;
}

export default ITeamMemberService;
