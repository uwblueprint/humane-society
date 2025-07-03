import { PetResponseDTO } from "../implementations/petService";
import { UserResponseDTO } from "../implementations/userService";

export interface IMatchmakingService {
  /* eslint-disable class-methods-use-this */
  getMatchingPetsForUser(userId: string): Promise<PetResponseDTO[]>;
  getMatchingUsersForPet(petId: string): Promise<UserResponseDTO[]>;
}
