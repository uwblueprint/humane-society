import PetResponseDTO from "../interfaces/petService";
import UserResponseDTO from "../interfaces/userService";

export interface IMatchmakingService {
  /* eslint-disable class-methods-use-this */
  getMatchingPetsForUser(userId: string): Promise<PetResponseDTO[]>;
  getMatchingUsersForPet(petId: string): Promise<UserResponseDTO[]>;
}
