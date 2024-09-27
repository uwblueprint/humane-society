import { Router } from "express";

import { createTeamMemberDtoValidator } from "../middlewares/validators/teamMemberValidators";
import TeamMemberService from "../services/implementations/teamMemberService";
import { TeamRole, TeamMemberDTO, CreateTeamMemberDTO } from "../types";
import {
  getErrorMessage,
  NotFoundError,
  INTERNAL_SERVER_ERROR_MESSAGE,
} from "../utilities/errorUtils";
import ITeamMemberService from "../services/interfaces/teamMemberService";

const teamMemberRouter: Router = Router();
const teamMemberService: ITeamMemberService = new TeamMemberService();

teamMemberRouter.get("/", async (req, res) => {
  try {
    const teamMembers = await teamMemberService.getTeamMembers();
    res.status(200).json(teamMembers);
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
});

teamMemberRouter.post("/", createTeamMemberDtoValidator, async (req, res) => {
  let data: CreateTeamMemberDTO = req.body;
  try {
    const newUser = await teamMemberService.createTeamMember(data);
    res.status(201).json(newUser);
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
});

export default teamMemberRouter;
