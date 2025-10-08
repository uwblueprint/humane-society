// routing = mapping a URL to a function in backend that decides what happens when someone calls it
// thsi file will hold all the endpoints for the team members
import { Router } from "express";
import TeamMemberService from "../services/implementations/teamMemberService";
import { getErrorMessage } from "../utilities/errorUtils";
import { CreateTeamMemberDTO } from "../types";
import { createTeamMemberDtoValidator } from "../middlewares/validators/teamMemberValidators";

// router object to hold all endpoints for team members
const teamMemberRouter: Router = Router();
// instance of service class 
const teamMemberService = new TeamMemberService();
//GET team mebers
teamMemberRouter.get("/", async (req, res) => {
    try {
        //success
        const teamMembers = await teamMemberService.getTeamMembers();
        res.status(200).json(teamMembers);
    } catch (error: unknown) {
        //failure
        res.status(500).json({error : getErrorMessage (error)});
    }
});
// create new team member POST
teamMemberRouter.post("/", createTeamMemberDtoValidator, async (req, res) => {
    const data: CreateTeamMemberDTO = req.body; // request body contains data of new team member
    try {
        const newTeamMember = await teamMemberService.createTeamMember(data);
        res.status(201).json(newTeamMember);
    } catch (error: unknown ){
        res.status(500).json({ error: getErrorMessage(error)});
    }
});

export default teamMemberRouter;