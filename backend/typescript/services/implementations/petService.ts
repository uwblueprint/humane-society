import { DateTime } from "luxon";
import { QueryTypes, Transaction } from "sequelize";
import PgPet from "../../models/pet.model";
import { sequelize } from "../../models";
import PgPetCareInfo from "../../models/petCareInfo.model";
import PgUser from "../../models/user.model";
import { colorLevelToEnum, dateToISOString } from "../../utilities/common";
import { getErrorMessage, NotFoundError } from "../../utilities/errorUtils";
import logger from "../../utilities/logger";
import TaskService from "./taskService";
import { ITaskService } from "../interfaces/taskService";
import {
  IPetService,
  PetListItemDTO,
  PetListSections,
  PetRawDTO,
  // PetQuery,
  PetRequestDTO,
  PetResponseDTO,
} from "../interfaces/petService";
import {
  AnimalTag,
  LastCaredFor,
  PetStatus,
  Role,
  TaskCategory,
} from "../../types";

const Logger = logger(__filename);

const TIME_ZONE = "America/New_York";

const taskService: ITaskService = new TaskService();

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

  // Derive a pet's status from its tasks scheduled for today
  private async computePetStatus(petId: number): Promise<PetStatus> {
    const todayLocal = DateTime.now().setZone(TIME_ZONE);
    const today = [
      todayLocal.year,
      String(todayLocal.month).padStart(2, "0"),
      String(todayLocal.day).padStart(2, "0"),
    ].join("-");

    const tasksToday = await taskService.getTasksForDate(today, { petId });

    let hasIncompleteTask = false;
    let hasInProgressTask = false;
    tasksToday.forEach((task) => {
      if (!task.endTime) {
        hasIncompleteTask = true;
        if (task.startTime) {
          hasInProgressTask = true;
        }
      }
    });

    if (hasInProgressTask) return PetStatus.OCCUPIED;
    if (hasIncompleteTask) return PetStatus.NEEDS_CARE;
    return PetStatus.DOES_NOT_NEED_CARE;
  }

  async getProfilePhotosByIds(
    petIds: number[],
  ): Promise<Record<number, string | null>> {
    const pets = await PgPet.findAll({
      where: { id: petIds },
      attributes: ["id", "photo"],
    });

    const photosById: Record<number, string | null> = {};
    pets.forEach((pet) => {
      photosById[pet.id] = pet.photo ?? null;
    });
    return photosById;
  }

  async getPet(id: string): Promise<PetRawDTO> {
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

    const status = await this.computePetStatus(pet.id);

    return {
      id: pet.id,
      animalTag: pet.animal_tag,
      name: pet.name,
      colorLevel: pet.color_level,
      status,
      breed: pet.breed,
      neutered: pet.neutered,
      birthday: pet.birthday,
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

  async createPet(pet: PetRequestDTO): Promise<PetResponseDTO> {
    let newPet: PgPet | undefined;
    let newPetCareInfo: PgPetCareInfo | undefined;

    const transaction: Transaction = await sequelize.transaction();
    try {
      newPet = await PgPet.create(
        {
          animal_tag: pet.animalTag,
          name: pet.name,
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
      // a newly created pet has no tasks yet
      status: PetStatus.DOES_NOT_NEED_CARE,
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
      if (petUpdateResult[0]) {
        [, [resultingPet]] = petUpdateResult;
      } else {
        // No pets-table columns changed (e.g. a care-info-only update). Confirm
        // the pet exists and use its current row instead of treating a no-op
        // update as "not found".
        const existingPet = await PgPet.findByPk(id, { transaction });
        if (!existingPet) {
          throw new NotFoundError(`Pet id ${id} not found`);
        }
        resultingPet = existingPet;
      }

      if (pet.careInfo) {
        petCareInfoUpdateResult = await PgPetCareInfo.update(
          {
            safety_info: pet.careInfo?.safetyInfo,
            medical_info: pet.careInfo?.medicalInfo,
            management_info: pet.careInfo?.managementInfo,
          },
          { where: { pet_id: id }, returning: true, transaction },
        );
        if (petCareInfoUpdateResult[0]) {
          [, [resultingPetCareInfo]] = petCareInfoUpdateResult;
        } else {
          // if no existing row in pet care info, create
          resultingPetCareInfo = await PgPetCareInfo.create(
            {
              pet_id: Number(id),
              safety_info: pet.careInfo?.safetyInfo,
              medical_info: pet.careInfo?.medicalInfo,
              management_info: pet.careInfo?.managementInfo,
            },
            { transaction },
          );
        }
      }

      await transaction.commit();
    } catch (error: unknown) {
      await transaction.rollback();

      Logger.error(`Failed to update pet. Reason = ${getErrorMessage(error)}`);
      throw error;
    }

    const status = await this.computePetStatus(Number(id));

    return {
      id: resultingPet.id,
      animalTag: resultingPet.animal_tag,
      name: resultingPet.name,
      colorLevel: resultingPet.color_level,
      status,
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

  // Within section order by care urgency
  private sortPetListByCareUrgency(
    pets: PetListItemDTO[],
    beginningOfTodayISO: string,
  ): PetListItemDTO[] {
    pets.sort((a, b) => {
      // Occupied pets are lowest priority (already being cared for)
      if (a.status === PetStatus.OCCUPIED) return 1;
      if (b.status === PetStatus.OCCUPIED) return -1;

      // Never cared for pets are highest priority
      if (a.lastCaredFor === null) return -1;
      if (b.lastCaredFor === null) return 1;

      // Both are non-null strings
      // Compare directly; older dates are higher priority
      if (a.lastCaredFor && b.lastCaredFor) {
        return a.lastCaredFor.localeCompare(b.lastCaredFor);
      }

      return 0;
    });

    // Convert old dates to One or more days ago for display
    return pets.map((pet) => {
      if (
        pet.lastCaredFor &&
        pet.lastCaredFor !== LastCaredFor.ONE_OR_MORE_DAYS_AGO &&
        pet.lastCaredFor < beginningOfTodayISO
      ) {
        return {
          ...pet,
          lastCaredFor: LastCaredFor.ONE_OR_MORE_DAYS_AGO,
        };
      }
      return pet;
    });
  }

  // Volunteer eligibility check (tags + color level)
  private canVolunteerCareToday(
    user: PgUser,
    petAnimalTag: AnimalTag,
    petColorLevelNum: number,
  ): boolean {
    const hasTag = (user.animal_tags || []).includes(petAnimalTag);
    const colorOk = user.color_level >= petColorLevelNum; // user must be greater than or equal to pet level
    return hasTag && colorOk; // both conditions must be true
  }

  // Build sections for volunteer view
  private buildSectionsVolunteer(
    allPets: PetListItemDTO[],
    user: PgUser,
    petColorLevelMap: Record<number, number>,
    petAnimalTagMap: Record<number, AnimalTag>,
  ): PetListSections {
    const sections: PetListSections = {
      "Assigned to You": [],
      "Other Pets": [],
    };

    const added = new Set<number>();

    const pushOnce = (
      target: string,
      pet: PetListItemDTO,
      addedSet: Set<number>,
    ) => {
      if (!sections[target]) sections[target] = [];
      if (!addedSet.has(pet.id)) {
        sections[target].push(pet);
        addedSet.add(pet.id);
      }
    };

    allPets
      .filter((pet) => {
        // A pet assigned to me (e.g. an override assignment) always shows,
        // regardless of colour/tag eligibility - otherwise the volunteer has
        // assigned work they can never discover. isAssignedToMe is only set
        // for an incomplete task today, so allTasksAssigned is already non-null.
        if (pet.isAssignedToMe) return true;

        const canCare = this.canVolunteerCareToday(
          user,
          petAnimalTagMap[pet.id],
          petColorLevelMap[pet.id],
        );
        if (!canCare) return false;

        // Only show pets with >=1 incomplete task scheduled today
        // (allTasksAssigned is null when a pet has no incomplete tasks today)
        return pet.allTasksAssigned !== null;
      })
      .forEach((pet) => {
        if (pet.isAssignedToMe) {
          // Has an incomplete task today assigned to me
          pushOnce("Assigned to You", pet, added);
        } else if (pet.allTasksAssigned === false) {
          // Has an incomplete, unassigned task today, so it's self-assignable
          pushOnce("Other Pets", pet, added);
        }
        // Otherwise every incomplete task today is assigned to someone else, so it's excluded
      });

    // Sort each section by care urgency
    const beginningOfTodayISO = dateToISOString(
      DateTime.now().setZone(TIME_ZONE).startOf("day"),
    );
    sections["Assigned to You"] = this.sortPetListByCareUrgency(
      sections["Assigned to You"],
      beginningOfTodayISO,
    );
    sections["Other Pets"] = this.sortPetListByCareUrgency(
      sections["Other Pets"],
      beginningOfTodayISO,
    );

    return sections;
  }

  // Build sections for admin view (Staff/AB/Admin)
  private buildSectionsAdmin(
    allPets: PetListItemDTO[],
    user: PgUser,
  ): PetListSections {
    const sections: PetListSections = {};
    const added = new Set<number>();

    const pushOnce = (
      target: string,
      pet: PetListItemDTO,
      addedSet: Set<number>,
    ) => {
      if (!sections[target]) sections[target] = [];
      if (!addedSet.has(pet.id)) {
        sections[target].push(pet);
        addedSet.add(pet.id);
      }
    };

    const isStaff = user.role === Role.STAFF;
    const isAB = user.role === Role.ANIMAL_BEHAVIOURIST;

    // Staff/AB have "Assigned to You" section
    if (isStaff || isAB) {
      sections["Assigned to You"] = [];
    }
    sections["Unassigned Tasks"] = [];
    sections["Assigned Tasks"] = [];
    sections["No Tasks"] = [];

    allPets.forEach((pet) => {
      // Staff/AB get "Assigned to You" first; if placed here, skip others.
      if ((isStaff || isAB) && pet.isAssignedToMe) {
        pushOnce("Assigned to You", pet, added);
        return;
      }

      // Next priority: Unassigned Tasks
      if (pet.allTasksAssigned === false) {
        pushOnce("Unassigned Tasks", pet, added);
        return;
      }

      // Then: Assigned Tasks (TODAY)
      if (pet.allTasksAssigned === true) {
        pushOnce("Assigned Tasks", pet, added);
        return;
      }

      // Finally: No Tasks (no tasks today or all complete)
      pushOnce("No Tasks", pet, added);
    });

    // Sort each section by care urgency
    const beginningOfTodayISO = dateToISOString(
      DateTime.now().setZone(TIME_ZONE).startOf("day"),
    );
    Object.keys(sections).forEach((k) => {
      sections[k] = this.sortPetListByCareUrgency(
        sections[k],
        beginningOfTodayISO,
      );
    });

    return sections;
  }

  // Build sections per role and sort each section by care urgency
  private buildSectionsByRole(
    allPets: PetListItemDTO[],
    user: PgUser,
    petColorLevelMap: Record<number, number>,
    petAnimalTagMap: Record<number, AnimalTag>,
  ): PetListSections {
    if (user.role === Role.VOLUNTEER) {
      return this.buildSectionsVolunteer(
        allPets,
        user,
        petColorLevelMap,
        petAnimalTagMap,
      );
    }

    // Admin view for Staff/AB/Admin
    return this.buildSectionsAdmin(allPets, user);
  }

  async getPetList(userId: number): Promise<PetListSections> {
    const todayLocal = DateTime.now().setZone(TIME_ZONE);
    const today = [
      todayLocal.year,
      String(todayLocal.month).padStart(2, "0"),
      String(todayLocal.day).padStart(2, "0"),
    ].join("-");

    try {
      // Fetch user
      const user = await PgUser.findByPk(userId);
      if (!user) return {};

      const pets = await PgPet.findAll({ raw: true });

      const completions = await sequelize.query<{
        pet_id: number | null;
        end_time: Date;
      }>(
        `SELECT COALESCE(t.pet_id, anchor.pet_id) AS pet_id, t.end_time AS end_time
         FROM tasks t
         LEFT JOIN tasks anchor ON t.origin_task_id = anchor.id
         WHERE t.end_time IS NOT NULL`,
        { type: QueryTypes.SELECT },
      );
      const petIdToLastCaredFor: Record<number, string> = {};
      completions.forEach(({ pet_id: petId, end_time: endTime }) => {
        if (petId == null) return;
        const endTimeISO = dateToISOString(
          DateTime.fromJSDate(endTime).setZone(TIME_ZONE),
        );
        if (
          !petIdToLastCaredFor[petId] ||
          endTimeISO > petIdToLastCaredFor[petId]
        ) {
          petIdToLastCaredFor[petId] = endTimeISO;
        }
      });

      const tasksToday = await taskService.getTasksForDate(today);

      const petIdToColorLevel: Record<number, number> = {};
      const petIdToAnimalTag: Record<number, AnimalTag> = {};
      const petIdToTaskCategories: Record<number, TaskCategory[]> = {};
      const petIdToAllTasksAssigned: Record<number, boolean> = {};
      const petIdToIsAssignedToMe: Record<number, boolean> = {};
      const petIdToHasIncompleteTaskToday: Record<number, boolean> = {};
      const petIdToHasInProgressTaskToday: Record<number, boolean> = {};

      pets.forEach((pet) => {
        petIdToColorLevel[pet.id] = pet.color_level;
        petIdToAnimalTag[pet.id] = pet.animal_tag as AnimalTag;
      });

      tasksToday
        .filter((task) => !task.endTime)
        .forEach((task) => {
          const { petId } = task;
          petIdToHasIncompleteTaskToday[petId] = true;
          if (task.startTime) {
            petIdToHasInProgressTaskToday[petId] = true;
          }
          if (task.category) {
            if (!petIdToTaskCategories[petId]) {
              petIdToTaskCategories[petId] = [];
            }
            petIdToTaskCategories[petId].push(task.category);
          }
          if (petIdToAllTasksAssigned[petId] === undefined) {
            petIdToAllTasksAssigned[petId] = true;
          }
          if (!task.userId) {
            petIdToAllTasksAssigned[petId] = false;
          }
          if (task.userId === user.id) {
            petIdToIsAssignedToMe[petId] = true;
          }
        });

      const allPets: PetListItemDTO[] = pets.map((pet) => {
        const hasActiveTasksToday = !!petIdToTaskCategories[pet.id]?.length;

        let status = PetStatus.DOES_NOT_NEED_CARE;
        if (petIdToHasInProgressTaskToday[pet.id]) {
          status = PetStatus.OCCUPIED;
        } else if (petIdToHasIncompleteTaskToday[pet.id]) {
          status = PetStatus.NEEDS_CARE;
        }

        return {
          id: pet.id,
          name: pet.name,
          photo: pet.photo,
          color: colorLevelToEnum(pet.color_level),
          taskCategories: petIdToTaskCategories[pet.id] ?? [],
          status,
          lastCaredFor: petIdToLastCaredFor[pet.id] ?? null,
          allTasksAssigned: hasActiveTasksToday
            ? petIdToAllTasksAssigned[pet.id] ?? null
            : null,
          isAssignedToMe: petIdToIsAssignedToMe[pet.id] ?? false,
          animalTag: pet.animal_tag as AnimalTag,
        };
      });

      // Build sectioned object by role
      return this.buildSectionsByRole(
        allPets,
        user,
        petIdToColorLevel,
        petIdToAnimalTag,
      );
    } catch (error: unknown) {
      Logger.error(getErrorMessage(error));
      throw error;
    }
  }
}

export default PetService;
