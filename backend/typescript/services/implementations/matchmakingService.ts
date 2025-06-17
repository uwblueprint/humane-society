import { IMatchmakingService } from "../interfaces/matchmakingService";
import { IPetService, PetResponseDTO } from "../interfaces/petService";
// import User from "../../models/user.model";
// import Pet from "../../models/pet.model";
import { getErrorMessage } from "../../utilities/errorUtils";
import logger from "../../utilities/logger";
import { Op } from "sequelize";
import PgPet from "../../models/pet.model";
import IUserService from "../interfaces/userService";
import { UserDTO } from "../../types";

const Logger = logger(__filename);

export default class MatchmakingService implements IMatchmakingService {
    userService: IUserService;
    petService: IPetService;
    constructor(userService: IUserService, petService: IPetService) {
        this.userService = userService;
        this.petService = petService;
    }
    
    async getMatchingPetsForUser(userId: string): Promise<PetResponseDTO[]> {
        try {
            const userLevel = (await this.userService.getUserById(userId)).colorLevel;

            const matchingPets = await PgPet.findAll({
                where: {
                    color_level: {
                        [Op.lte]: userLevel
                    }
                }
            });

            return matchingPets.map(pet => ({
                id: pet.id,
                name: pet.name,
                animalTag: pet.animal_tag,
                colorLevel: pet.color_level,
                status: pet.status,
                breed: pet.breed,
                age: pet.birthday ? this.petService.getAgeFromBirthday(pet.birthday) : undefined,
                weight: pet.weight,
                sex: pet.sex,
                photo: pet.photo,
                careInfo: {
                    id: pet.petCareInfo?.id,
                    safetyInfo: pet.petCareInfo?.safety_info,
                    medicalInfo: pet.petCareInfo?.medical_info,
                    managementInfo: pet.petCareInfo?.management_info,
                }
            }));
        } catch (error) {
            Logger.error(`Failed to get matching pets for user. Reason = ${getErrorMessage(error)}`);
            throw error;
        }
    }

    async getMatchingUsersForPet(petId: string): Promise<UserDTO[]> {
        try {
            const petLevel = (await this.petService.getPet(petId)).colorLevel;
            const allUsers = await this.userService.getUsers();

            return allUsers.filter(user => user.colorLevel >= petLevel);
        } catch (error) {
            Logger.error(`Failed to get matching users for pet. Reason = ${getErrorMessage(error)}`);
            throw error;
        }
    }
}