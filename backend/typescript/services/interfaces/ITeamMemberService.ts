// getTeamMembers()

// createTeamMember(teamMember)

import { CreateTeamMemberDTO, TeamMemberDTO } from "../../types";
interface ITeamMemberService {
    // return a list of all team members in database 
    getTeamMembers(): Promise<TeamMemberDTO[]>; // promise = return when async task finishes
    createTeamMember(teamMember: CreateTeamMemberDTO): Promise<TeamMemberDTO>;
}

export default ITeamMemberService;
