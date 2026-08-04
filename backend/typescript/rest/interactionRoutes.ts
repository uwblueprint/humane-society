import { Router } from "express";
import { getAccessToken } from "../middlewares/auth";
import InteractionService from "../services/implementations/interactionService";
import AuthService from "../services/implementations/authService";
import UserService from "../services/implementations/userService";
import IAuthService from "../services/interfaces/authService";
import { Role } from "../types";
import {
  getErrorMessage,
  INTERNAL_SERVER_ERROR_MESSAGE,
} from "../utilities/errorUtils";

const interactionRouter: Router = Router();

const authService: IAuthService = new AuthService(new UserService());

/* Get all interactions with actor and interaction type data */
interactionRouter.get("/", async (req, res) => {
  try {
    const accessToken = getAccessToken(req);
    if (!accessToken) {
      res.status(401).json({ error: "Access token not found" });
      return;
    }

    const isAuthorized = await authService.isAuthorizedByRole(
      accessToken,
      new Set([Role.ADMINISTRATOR, Role.ANIMAL_BEHAVIOURIST, Role.STAFF]),
    );

    if (!isAuthorized) {
      res.status(403).json({ error: "Not authorized to view interactions" });
      return;
    }

    const interactions = await InteractionService.getInteractions();
    res.status(200).json(interactions);
  } catch (error: unknown) {
    res.status(500).json({
      error: getErrorMessage(error) || INTERNAL_SERVER_ERROR_MESSAGE,
    });
  }
});

export default interactionRouter;
