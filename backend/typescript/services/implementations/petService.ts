import { Transaction, QueryTypes } from "sequelize";
import { DateTime } from "luxon";
import PgPet from "../../models/pet.model";
// import PgTask from "../../models/task.model";
// import PgTaskTemplate from "../../models/taskTemplate.model";
import PgPetCareInfo from "../../models/petCareInfo.model";
import PgUser from "../../models/user.model";
import TaskTemplate from "../../models/taskTemplate.model";
import {
  IPetService,
  PetListItemDTO,
  // PetQuery,
  PetRequestDTO,
  PetResponseDTO,
  PetActivity,
} from "../interfaces/petService";
import { getErrorMessage, NotFoundError } from "../../utilities/errorUtils";
import logger from "../../utilities/logger";
import { sequelize } from "../../models";
// import TaskTemplate from "../../models/taskTemplate.model";
// import { Role } from "../../types";
import { PetStatus, ColorLevel } from "../../types";

const Logger = logger(__filename);

const TIME_ZONE = "America/New_York";

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

  // petList helper functions
  dateToTimeString(date: DateTime): string {
    return date.setZone(TIME_ZONE).toFormat("t");
  }

  timeStringToDate(timeStr: string): DateTime {
    const currentTime = DateTime.now().setZone(TIME_ZONE);
    const fullDateString = `${currentTime.toFormat("DDDD")} ${timeStr}`;

    try {
      return DateTime.fromFormat(fullDateString, "DDDD t");
    } catch (error: unknown) {
      Logger.error(
        `Failed to parse time string: ${timeStr}. Reason = ${getErrorMessage(
          error,
        )}`,
      );
      throw error;
    }
  }

  colorLevelToEnum(colorLevel: number): ColorLevel {
    // (values are in descending order)
    return Object.values(ColorLevel)[5 - colorLevel];
  }

  sortPetItemListByStatus(petList: PetListItemDTO[]): PetListItemDTO[] {
    const statusToPriority: Record<PetStatus, number> = {
      [PetStatus.NEEDS_CARE]: 0,
      [PetStatus.OCCUPIED]: 1,
      [PetStatus.DOES_NOT_NEED_CARE]: 2,
    };
    // put pets with 'needs care' status first, then occupied, then does not need care
    const statusSortFunction = (a: PetListItemDTO, b: PetListItemDTO) => {
      return statusToPriority[a.status] - statusToPriority[b.status];
    };
    return petList.sort(statusSortFunction);
  }

  async getPetList(userId: number): Promise<PetListItemDTO[]> {
    const PET_TABLE_NAME = "pets";
    const TASK_TABLE_NAME = "tasks";
    const ONE_OR_MORE_DAYS_AGO = "One or more days ago";

    // date constants
    const currentTime = DateTime.now().setZone(TIME_ZONE);

    const beginningOfToday = currentTime.set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });
    try {
      // get the user's role
      const user = await PgUser.findByPk(userId);
      if (!user) {
        return [];
      }
      const currUserId = user.id;

      const petTasks = await sequelize.query<PetActivity>(
        `SELECT 
        ${PET_TABLE_NAME}.id AS pet_id,
        ${PET_TABLE_NAME}.name AS name,
        ${PET_TABLE_NAME}.status AS status,
        ${PET_TABLE_NAME}.photo AS photo,
        ${PET_TABLE_NAME}.color_level AS color_level,
        ${TASK_TABLE_NAME}.user_id AS user_id,
        ${TASK_TABLE_NAME}.task_template_id AS task_template_id,
        ${TASK_TABLE_NAME}.start_time AS start_time,
        ${TASK_TABLE_NAME}.end_time AS end_time
        FROM ${PET_TABLE_NAME}
        LEFT JOIN ${TASK_TABLE_NAME} ON ${PET_TABLE_NAME}.id=${TASK_TABLE_NAME}.pet_id`,
        { type: QueryTypes.SELECT },
      );
      const petIdToPetListItem: Record<string, PetListItemDTO> = {};

      // eslint-disable-next-line no-restricted-syntax
      for (const petTask of petTasks) {
        // if there's no task_template_id, that means this pet doesn't have any assigned tasks
        // (bc that's a mandatory column in tasks)
        if (!petTask.task_template_id) {
          petIdToPetListItem[petTask.pet_id] = {
            id: petTask.pet_id,
            name: petTask.name,
            photo: petTask.photo,
            color: this.colorLevelToEnum(petTask.color_level),
            taskCategories: [],
            status: petTask.status,
            lastCaredFor: ONE_OR_MORE_DAYS_AGO,
            allTasksAssigned: null, // null if there are no tasks
            isAssignedToMe: false,
          };
          // eslint-disable-next-line no-continue
          continue;
        }
        const petData = petIdToPetListItem[petTask.pet_id];
        // if the pet already exists in the hashMap
        if (petData) {
          // existing entry in the hashMap, to compare times
          if (!petTask.end_time) {
            // if the task has not finished
            if (petTask.start_time) {
              // if pet is currently occupied, last cared for is current time
              petData.lastCaredFor = this.dateToTimeString(currentTime);
            }
            // add task category
            // eslint-disable-next-line no-await-in-loop
            const taskTemplate = await TaskTemplate.findByPk(
              petTask.task_template_id,
            );
            if (taskTemplate) {
              petData.taskCategories.push(taskTemplate.category);
            } else {
              Logger.error(
                `Task template with ID ${petTask.task_template_id} not found.`,
              );
            }
            if (!petTask.user_id) {
              // check if task has not been assigned
              petData.allTasksAssigned = false;
            } else if (petTask.user_id === currUserId) {
              // if it is, check if task is assigned to user
              petData.isAssignedToMe = true;
            }
          } else {
            // if task has finished
            const endTime = DateTime.fromJSDate(petTask.end_time);
            if (petData.lastCaredFor === ONE_OR_MORE_DAYS_AGO) {
              if (endTime > beginningOfToday) {
                petData.lastCaredFor = this.dateToTimeString(endTime);
              }
            } else if (endTime > this.timeStringToDate(petData.lastCaredFor)) {
              petData.lastCaredFor = this.dateToTimeString(endTime);
            }
          }
        } else {
          // if the pet does not exist in the map
          let lastCaredFor;
          const taskCategories = [];
          if (!petTask.end_time) {
            // if the task has not finished
            if (petTask.start_time) {
              lastCaredFor = this.dateToTimeString(currentTime); // pet is currently occupied
            } else {
              lastCaredFor = ONE_OR_MORE_DAYS_AGO; // assume if a pet has never been cared for it should read 'One or more days ago'
            }
            // add task category
            // eslint-disable-next-line no-await-in-loop
            const taskTemplate = await TaskTemplate.findByPk(
              petTask.task_template_id,
            );
            if (taskTemplate) {
              taskCategories.push(taskTemplate.category);
            } else {
              Logger.error(
                `Task template with ID ${petTask.task_template_id} not found.`,
              );
            }
          } else {
            // if the task has finished
            const endTime = DateTime.fromJSDate(petTask.end_time);
            if (endTime <= beginningOfToday) {
              // task has finished longer than a day ago
              lastCaredFor = ONE_OR_MORE_DAYS_AGO;
            } else {
              // task has finished sooner than a day ago
              lastCaredFor = this.dateToTimeString(endTime);
            }
          }
          petIdToPetListItem[petTask.pet_id] = {
            id: petTask.pet_id,
            name: petTask.name,
            photo: petTask.photo,
            color: this.colorLevelToEnum(petTask.color_level),
            taskCategories,
            status: petTask.status,
            lastCaredFor,
            allTasksAssigned: !!petTask.user_id, // if the task has a user associated with it, it's assigned
            isAssignedToMe: petTask.user_id === currUserId,
          };
        }
      }
      const unsortedPetList = Object.values(petIdToPetListItem);
      // SORT -- first put everything assigned to the user first, and then within each section, sort based on status/urgency
      const assignedToUser: PetListItemDTO[] = [];
      const notAssignedToUser: PetListItemDTO[] = [];
      unsortedPetList.forEach((petItem) => {
        if (petItem.isAssignedToMe) {
          assignedToUser.push(petItem);
        } else {
          notAssignedToUser.push(petItem);
        }
      });
      const sortedAssignedPetList =
        this.sortPetItemListByStatus(assignedToUser);
      const sortedNotAssignedPetList =
        this.sortPetItemListByStatus(notAssignedToUser);
      const sortedPetList = sortedAssignedPetList.concat(
        sortedNotAssignedPetList,
      );
      return sortedPetList;
    } catch (error: unknown) {
      Logger.error(getErrorMessage(error));
      throw error;
    }
  }
}

export default PetService;
