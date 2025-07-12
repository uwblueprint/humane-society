import { Router } from "express";
import MatchmakingService from "../services/implementations/matchmakingService";
import { IMatchmakingService } from "../services/interfaces/matchmakingService";
import UserService from "../services/implementations/userService";
import PetService from "../services/implementations/petService";
import {
  getErrorMessage,
  INTERNAL_SERVER_ERROR_MESSAGE,
  NotFoundError,
} from "../utilities/errorUtils";

const matchmakingRouter: Router = Router();
const userService = new UserService();
const petService = new PetService();
const matchmakingService: IMatchmakingService = new MatchmakingService(
  userService,
  petService,
);

/* Get matching pets for user */
matchmakingRouter.get("/users/:userId/pets", async (req, res) => {
  const { userId } = req.params;

  try {
    const matchingPets = await matchmakingService.getMatchingPetsForUser(
      userId,
    );
    res.status(200).json(matchingPets);
  } catch (e: unknown) {
    if (e instanceof NotFoundError) {
      res.status(404).send(getErrorMessage(e));
    } else {
      res.status(500).send(INTERNAL_SERVER_ERROR_MESSAGE);
    }
  }
});

matchmakingRouter.get("/pets/:petId/users", async (req, res) => {
  const { petId } = req.params;

  try {
    const matchingUsers = await matchmakingService.getMatchingUsersForPet(
      petId,
    );
    res.status(200).json(matchingUsers);
  } catch (e: unknown) {
    if (e instanceof NotFoundError) {
      res.status(404).send(getErrorMessage(e));
    } else {
      res.status(500).send(INTERNAL_SERVER_ERROR_MESSAGE);
    }
  }
});

export default matchmakingRouter;
