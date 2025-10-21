import { PetResponseDTO } from "./petService";
import { UserDTO } from "../../types";

export interface IMatchmakingService {
  /* eslint-disable class-methods-use-this */
  getMatchingPetsForUser(userId: string): Promise<PetResponseDTO[]>;
  getMatchingUsersForPet(petId: string): Promise<UserDTO[]>;
}
