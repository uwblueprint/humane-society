import { Transaction } from "sequelize";
import PgPet from "../../models/pet.model";
// import PgActivity from "../../models/activity.model";
// import PgActivityType from "../../models/activityType.model";
import PgPetCareInfo from "../../models/petCareInfo.model";
// import PgUser from "../../models/user.model";
import {
  IPetService,
  // PetListResponseDTO,
  // PetQuery,
  PetRequestDTO,
  PetResponseDTO,
} from "../interfaces/petService";
import { getErrorMessage, NotFoundError } from "../../utilities/errorUtils";
import logger from "../../utilities/logger";
import { sequelize, User } from "../../models";
// import ActivityType from "../../models/activityType.model";
// import { Role } from "../../types";

const Logger = logger(__filename);

class PetService implements IPetService {
  /* eslint-disable class-methods-use-this */
  getAgeFromBirthday(birthday: string): number {
    const parsedBirthday = Date.parse(birthday);
    const currentDate = new Date();
    const ageInMs = currentDate.valueOf() - parsedBirthday.valueOf();
    const msInYear = 1000 * 60 * 60 * 24 * 365.25;
    const age = Math.floor(ageInMs / msInYear);
    return age;
  }

  async getPet(id: string): Promise<PetResponseDTO> {
    let pet: PgPet | null;
    try {
      pet = await PgPet.findByPk(id, { include: PgPetCareInfo, plain: true });
      if (!pet) {
        throw new NotFoundError(`Pet id ${id} not found`);
      }
    } catch (error: unknown) {
      Logger.error(`Failed to get pet. Reason = ${getErrorMessage(error)}`);
      throw error;
    }

    return {
      id: pet.id,
      animalTag: pet.animal_tag,
      name: pet.name,
      colorLevel: pet.color_level,
      status: pet.status,
      breed: pet.breed,
      age: pet.birthday ? this.getAgeFromBirthday(pet.birthday) : undefined,
      weight: pet.weight,
      sex: pet.sex,
      photo: pet.photo,
      careInfo: {
        id: pet.petCareInfo?.id,
        safetyInfo: pet.petCareInfo?.safety_info,
        medicalInfo: pet.petCareInfo?.medical_info,
        managementInfo: pet.petCareInfo?.management_info,
      },
    };
  }

  async getPets(): Promise<PetResponseDTO[]> {
    let pets: Array<PgPet>;
    try {
      pets = await PgPet.findAll({
        include: [
          {
            model: PgPetCareInfo,
          },
        ],
      });
    } catch (error: unknown) {
      Logger.error(`Failed to get pets. Reason = ${getErrorMessage(error)}`);
      throw error;
    }

    return pets.map((pet) => ({
      id: pet.id,
      name: pet.name,
      animalTag: pet.animal_tag,
      colorLevel: pet.color_level,
      status: pet.status,
      breed: pet.breed,
      age: pet.birthday ? this.getAgeFromBirthday(pet.birthday) : undefined,
      weight: pet.weight,
      sex: pet.sex,
      photo: pet.photo,
      careInfo: {
        id: pet.petCareInfo?.id,
        safetyInfo: pet.petCareInfo?.safety_info,
        medicalInfo: pet.petCareInfo?.medical_info,
        managementInfo: pet.petCareInfo?.management_info,
      },
    }));
  }

  async createPet(pet: PetRequestDTO): Promise<PetResponseDTO> {
    let newPet: PgPet | undefined;
    let newPetCareInfo: PgPetCareInfo | undefined;

    const transaction: Transaction = await sequelize.transaction();
    try {
      newPet = await PgPet.create(
        {
          animal_tag: pet.animalTag,
          name: pet.name,
          status: pet.status,
          color_level: pet.colorLevel,
          breed: pet.breed,
          neutered: pet.neutered,
          birthday: pet.birthday,
          weight: pet.weight,
          sex: pet.sex,
          photo: pet.photo,
        },
        { transaction },
      );

      // create a pet care info if it's in the body
      newPetCareInfo = pet.careInfo
        ? await PgPetCareInfo.create(
            {
              pet_id: newPet.id,
              safety_info: pet.careInfo?.safetyInfo,
              medical_info: pet.careInfo?.medicalInfo,
              management_info: pet.careInfo?.managementInfo,
            },
            { transaction },
          )
        : undefined;

      await transaction.commit();
    } catch (error: unknown) {
      await transaction.rollback();
      Logger.error(`Failed to create pet. Reason = ${getErrorMessage(error)}`);
      throw error;
    }

    return {
      id: newPet.id,
      name: newPet.name,
      animalTag: newPet.animal_tag,
      colorLevel: newPet.color_level,
      status: newPet.status,
      breed: newPet.breed,
      neutered: newPet.neutered,
      age: newPet.birthday
        ? this.getAgeFromBirthday(newPet.birthday)
        : undefined,
      weight: newPet.weight,
      sex: newPet.sex,
      photo: newPet.photo,
      careInfo: newPetCareInfo
        ? {
            id: newPetCareInfo?.id,
            safetyInfo: newPetCareInfo?.safety_info,
            medicalInfo: newPetCareInfo?.medical_info,
            managementInfo: newPetCareInfo?.management_info,
          }
        : undefined,
    };
  }

  // FILTER IS NOW IMPLEMENTED IN FRONT END
  // async filterPets(query: PetQuery): Promise<PetResponseDTO[]> {
  //   try {
  //     const {
  //       animalTypeId,
  //       name,
  //       status,
  //       breed,
  //       age,
  //       adoptionStatus,
  //       weight,
  //       neutered,
  //       sex,
  //     } = query;
  //     const filters: WhereOptions = {};

  //     if (animalTypeId) filters.animal_type_id = Number(animalTypeId);
  //     if (name) filters.name = { [Op.iLike]: `%${name}%` }; // case-insensitive partial match
  //     if (status) filters.status = String(status);
  //     if (breed) filters.breed = { [Op.iLike]: `%${breed}%` }; // case-insensitive partial match
  //     if (age) filters.age = Number(age);
  //     if (adoptionStatus) filters.adoption_status = adoptionStatus === "true";
  //     if (weight) filters.weight = Number(weight);
  //     if (neutered) filters.neutered = neutered === "true";
  //     if (sex) filters.sex = String(sex);

  //     const pets: Array<PgPet> = await PgPet.findAll({
  //       where: filters,
  //     });
  //     const petResponseDTOs: PetResponseDTO[] = await Promise.all(
  //       pets.map(async (pet) => {
  //         return {
  //           id: pet.id,
  //           animalTypeId: pet.animal_type_id,
  //           name: pet.name,
  //           status: pet.status,
  //           breed: pet.breed,
  //           age: pet.age,
  //           adoptionStatus: pet.adoption_status,
  //           weight: pet.weight,
  //           neutered: pet.neutered,
  //           sex: pet.sex,
  //           photo: pet.photo,
  //           careInfo: {
  //             id: pet?.petCareInfo?.id ?? null,
  //             safetyInfo: pet?.petCareInfo?.safety_info ?? null,
  //             medicalInfo: pet?.petCareInfo?.medical_info ?? null,
  //             managementInfo: pet?.petCareInfo?.management_info ?? null,
  //           },
  //         };
  //       }),
  //     );

  //     return petResponseDTOs;
  //   } catch (error: unknown) {
  //     Logger.error(`Failed to get pets. Reason = ${getErrorMessage(error)}`);
  //     throw error;
  //   }
  // }

  async updatePet(id: string, pet: PetRequestDTO): Promise<PetResponseDTO> {
    let resultingPet: PgPet | undefined;
    let resultingPetCareInfo: PgPetCareInfo | undefined;
    let petUpdateResult: [number, PgPet[]] | undefined;
    let petCareInfoUpdateResult: [number, PgPetCareInfo[]] | undefined;

    const transaction: Transaction = await sequelize.transaction();

    try {
      petUpdateResult = await PgPet.update(
        {
          animal_tag: pet.animalTag,
          name: pet.name,
          status: pet.status,
          color_level: pet.colorLevel,
          breed: pet.breed,
          neutered: pet.neutered,
          birthday: pet.birthday,
          weight: pet.weight,
          sex: pet.sex,
          photo: pet.photo,
        },
        { where: { id }, returning: true, transaction },
      );
      if (!petUpdateResult[0]) {
        throw new NotFoundError(`Pet id ${id} not found`);
      }
      [, [resultingPet]] = petUpdateResult;

      if (pet.careInfo) {
        petCareInfoUpdateResult = await PgPetCareInfo.update(
          {
            safety_info: pet.careInfo?.safetyInfo,
            medical_info: pet.careInfo?.medicalInfo,
            management_info: pet.careInfo?.managementInfo,
          },
          { where: { pet_id: id }, returning: true, transaction },
        );
        // pet care info is not required anymore
        if (petCareInfoUpdateResult[0]) {
          [, [resultingPetCareInfo]] = petCareInfoUpdateResult;
        }
      }

      await transaction.commit();
    } catch (error: unknown) {
      await transaction.rollback();

      Logger.error(`Failed to update pet. Reason = ${getErrorMessage(error)}`);
      throw error;
    }

    return {
      id: resultingPet.id,
      animalTag: resultingPet.animal_tag,
      name: resultingPet.name,
      colorLevel: resultingPet.color_level,
      status: resultingPet.status,
      breed: resultingPet.breed,
      neutered: resultingPet.neutered,
      age: resultingPet.birthday
        ? this.getAgeFromBirthday(resultingPet.birthday)
        : undefined,
      weight: resultingPet.weight,
      sex: resultingPet.sex,
      photo: resultingPet.photo,
      careInfo: {
        id: resultingPetCareInfo?.id,
        safetyInfo: resultingPetCareInfo?.safety_info,
        medicalInfo: resultingPetCareInfo?.medical_info,
        managementInfo: resultingPetCareInfo?.management_info,
      },
    };
  }

  async deletePet(id: string): Promise<string> {
    try {
      const deletePetResult: number | null = await PgPet.destroy({
        where: { id },
      });

      if (!deletePetResult) {
        throw new NotFoundError(`Pet with id ${id} not found`);
      }
    } catch (error: unknown) {
      Logger.error(`Failed to delete pet. Reason = ${getErrorMessage(error)}`);
      throw error;
    }
    return id;
  }

  // async getPetList(userId: number): Promise<PetListResponseDTO[]> {
  //   const PET_TABLE_NAME = "pets";
  //   const ACTIVITY_TABLE_NAME = "activities";
  //   const OCCUPIED = "Occupied";
  //   const ONE_OR_MORE_DAYS_AGO = "One or more days ago";
  //   const currentTime = new Date();
  //   const oneDayAgo = currentTime.setDate(currentTime.getDate() - 1);
  //   try {
  //     const petList: PetListResponseDTO[] = [];
  //     type Pet = InferAttributes<PgPet>;
  //     type Activity = InferAttributes<PgActivity>;
  //     type PetActivity = Pet & Activity;

  //     // get the user's role somewhere
  //     const user = await PgUser.findByPk(userId);
  //     if (!user) {
  //       return [];
  //     }

  //     const userRole = user.role;

  //     const [petActivities] = await sequelize.query<PetActivity[]>(
  //       `SELECT * FROM ${PET_TABLE_NAME} INNER JOIN ${ACTIVITY_TABLE_NAME} ON ${PET_TABLE_NAME}.id=${ACTIVITY_TABLE_NAME}.pet_id`,
  //       { type: QueryTypes.SELECT },
  //     );
  //     const petIdToPetData: Record<string, PetListResponseDTO> = {}; // awful name tbh
  //     petActivities.forEach((petActivity) => {
  //       // immediately skip/break if the user is a volunteer and the pet status is does not need care
  //       if (userRole === Role.VOLUNTEER && petActivity.status === petStatusEnum[3]) {
  //         continue;
  //       }
  //       // if the pet already exists in the hashMap
  //       if (petIdToPetData[petActivity.pet_id]) {
  //         const petData = petIdToPetData[petActivity.pet_id]
  //         // add activity category if it has not completed yet
  //         // "(if the tasks are not completed (end_time is null) AND the start_time has not passed)" TYPO, THIS IS FIXED, I GOTTA MAKE SURE THIS FITS THSI CRITERIA
  //         if (petActivity.end_time === null && petActivity.start_time !== null) {
  //           const activityType = await ActivityType.findByPk(petActivity.activity_type_id);
  //           if (activityType) {
  //             petData.taskCategories.push(activityType.category);
  //             petData.lastCaredFor = OCCUPIED;
  //           } else {
  //             console.error(`Activity type with ID ${petActivity.activity_type_id} not found.`);
  //           }
  //         } else {
  //           // compare end times if we haven't found that the pet is currently occupied yet
  //           // (because if it is occupied, there's no more recent date)
  //           if (petData.lastCaredFor !== OCCUPIED) {
  //             if (petData.lastCaredFor === ONE_OR_MORE_DAYS_AGO) {
  //               // check if the current activity is more recent than one day ago
  //               if (petActivity.end_time?.getTime() > oneDayAgo.getTime()) { //  we need to 'parse' end_time since it's a sintrg
  //                 petData.lastCaredFor = petActivity.end_time
  //               }
  //             } else if (petActivity.end_time > petData.end_time) {
  //               petData.lastCaredFor = petActivity.end_time?.toLocaleTimeString();
  //             }
  //           }
  //         }
  //       } else {
  //         // if the pet does not exist in the map
  //         let lastCaredFor = petActivity.end_time;
  //         if (
  //           petActivity.start_time !== null &&
  //           petActivity.end_time === null
  //         ) {
  //           lastCaredFor = "Occupied";
  //         } else if (petActivity.endTime > oneDayAgo)
  //         petIdToPetData[petActivity.pet_id] = {
  //           id: petActivity.pet_id,
  //           name: petActivity.name,
  //           image: petActivity.image,
  //           color: petActivity.color,
  //           activityTypeArr: [petActivity.activity_type],
  //           status: petActivity.status,
  //           lastCaredFor,
  //           hasUnassignedTask,
  //         };
  //       }
  //     });
  //     const currentTime = new Date();
  //     const oneDayAgo = currentTime.setDate(currentTime.getDate() - 1);
  //     Object.values(petIdToPetData).forEach((petData) => {
  //       if ()
  //       if (petData.lastCaredFor < oneDayAgo) {
  //         petData.lastCaredFor = "One or more days ago";
  //       }
  //       petList.push(petData);
  //     });
  //     // join pet and activities table by pet_id
  //     // make a hashmap of pets to an object like {activityArr, mostRecentEndTime}
  //     // loop through every petActivity and fill the hashmap. only activities that are assigned today (and end time has not passed) should be pushed
  //     // then loop through the keys of petActivity (so basically just every pet)
  //     // push the PetListResponse object to the list (IF THEY ARE A VOLUNTEER, AND THE PET DOES NOT NEED CARE, DON'T PUSH)
  //     // ! am i supposed to be updating the occupied status?? no right??
  //     // unadoptedPets.forEach((pet) => {
  //     //   // need to get assignedTo, lastCaredfFor, and task categories
  //     //   const currPetListResponse: PetListResponseDTO= {
  //     //     id: pet.id,
  //     //     name: pet.name,
  //     //     image: pet.image,
  //     //     color: pet.color,
  //     //     status: pet.status,
  //     //   }
  //     // });
  //   } catch (e) {
  //     return [];
  //   }
  // }
}

export default PetService;
