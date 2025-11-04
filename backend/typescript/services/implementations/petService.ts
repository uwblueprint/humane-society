import { DateTime } from "luxon";
import { QueryTypes, Transaction } from "sequelize";
import PgPet from "../../models/pet.model";
// import PgTask from "../../models/task.model";
// import PgTaskTemplate from "../../models/taskTemplate.model";
import { sequelize } from "../../models";
import PgPetCareInfo from "../../models/petCareInfo.model";
import TaskTemplate from "../../models/taskTemplate.model";
import PgUser from "../../models/user.model";
import {
  colorLevelToEnum,
  dateToTimeString,
  timeStringToDateTime,
} from "../../utilities/common";
import { getErrorMessage, NotFoundError } from "../../utilities/errorUtils";
import logger from "../../utilities/logger";
import {
  IPetService,
  PetListItemDTO,
  // PetQuery,
  PetRequestDTO,
  PetResponseDTO,
  PetTask,
  PetListSections,
} from "../interfaces/petService";
// import TaskTemplate from "../../models/taskTemplate.model";
import {
  PetStatus,
  Role,
  AnimalTag,
  LastCaredFor,
  TaskCategory,
} from "../../types";

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

  sortPetListByStatus(petList: PetListItemDTO[]): PetListItemDTO[] {
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

  // Within section order by care urgency
  private sortPetListByCareUrgency(pets: PetListItemDTO[]): PetListItemDTO[] {
    // Lower number means higher priority
    const score = (p: PetListItemDTO): number => {
      if (p.status === PetStatus.NEEDS_CARE) {
        if (p.lastCaredFor === "One or more days ago") return 0;
        if (p.lastCaredFor === null) return 1; // never cared for
        return 2; // cared for today (time string)
      }
      if (p.status === PetStatus.OCCUPIED) return 3;
      return 4; // DOES_NOT_NEED_CARE
    };
    return pets.sort((a, b) => score(a) - score(b));
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

  // Build sections per role and sort each section by care urgency
  private buildSectionsByRole(
    allPets: PetListItemDTO[],
    user: PgUser,
    petColorLevelMap: Record<number, number>,
    petAnimalTagMap: Record<number, AnimalTag>,
  ): PetListSections {
    const sections: PetListSections = {};

    // Add a pet to the section if it hasn't been added yet
    const pushOnce = (
      target: string, // section name
      pet: PetListItemDTO,
      added: Set<number>, // track added pets to avoid duplicates
    ) => {
      if (!sections[target]) sections[target] = [];
      if (!added.has(pet.id)) {
        sections[target].push(pet);
        added.add(pet.id);
      }
    };

    const added = new Set<number>();

    const isVolunteer = user.role === Role.VOLUNTEER;
    const isStaff = user.role === Role.STAFF;
    const isAB = user.role === Role.ANIMAL_BEHAVIOURIST;

    // Show pets assigned to me in "Assigned to You" and other eligible pets in "Other Pets" if they need care or are occupied with unassigned tasks
    if (isVolunteer) {
      sections["Assigned to You"] = [];
      sections["Other Pets"] = [];

      allPets
        .filter((pet) => {
          const canCare = this.canVolunteerCareToday(
            user,
            petAnimalTagMap[pet.id],
            petColorLevelMap[pet.id],
          );
          if (!canCare) return false;

          // If assigned to me, always include (even if occupied)
          if (pet.isAssignedToMe) return true;

          // Include if pet needs care or is occupied but has tasks that still need to be assigned
          return (
            pet.status === PetStatus.NEEDS_CARE ||
            (pet.status === PetStatus.OCCUPIED &&
              pet.allTasksAssigned === false)
          );
        })
        .forEach((pet) => {
          if (pet.isAssignedToMe) {
            pushOnce("Assigned to You", pet, added);
          } else {
            pushOnce("Other Pets", pet, added);
          }
        });

      // Sort each section by care urgency
      sections["Assigned to You"] = this.sortPetListByCareUrgency(
        sections["Assigned to You"],
      );
      sections["Other Pets"] = this.sortPetListByCareUrgency(
        sections["Other Pets"],
      );
      return sections;
    }

    // ADMIN VIEW (Staff/AB/Admin share Admin View, but only Staff/AB have Assigned to You section)
    if (isStaff || isAB) {
      sections["Assigned to You"] = [];
    }
    sections["Has Unassigned Tasks"] = [];
    sections["All Tasks Assigned"] = [];
    sections["No Tasks"] = [];

    allPets.forEach((pet) => {
      // Staff/AB get "Assigned to You" first; if placed here, skip others.
      if ((isStaff || isAB) && pet.isAssignedToMe) {
        pushOnce("Assigned to You", pet, added);
        return;
      }

      // Next priority: Has Unassigned Tasks
      if (pet.allTasksAssigned === false) {
        pushOnce("Has Unassigned Tasks", pet, added);
        return;
      }

      // Then: All Tasks Assigned (TODAY)
      if (pet.allTasksAssigned === true) {
        pushOnce("All Tasks Assigned", pet, added);
        return;
      }

      // Finally: No Tasks (no tasks today or all complete)
      pushOnce("No Tasks", pet, added);
    });

    // Sort each section by care urgency
    Object.keys(sections).forEach((k) => {
      sections[k] = this.sortPetListByCareUrgency(sections[k]);
    });

    return sections;
  }

  async getPetList(userId: number): Promise<PetListSections> {
    const PET_TABLE_NAME = "pets";
    const TASK_TABLE_NAME = "tasks";

    // "today" window
    const currentTime = DateTime.now().setZone(TIME_ZONE);
    const beginningOfToday = currentTime.startOf("day");
    const endOfToday = beginningOfToday.plus({ days: 1 });

    try {
      // Fetch user
      const user = await PgUser.findByPk(userId);
      if (!user) return {};

      // Include animal_tag for volunteer gating (MINIMAL SQL change)
      const petTasks = await sequelize.query<
        PetTask & { animal_tag: AnimalTag }
      >(
        `SELECT 
          ${PET_TABLE_NAME}.id AS pet_id,
          ${PET_TABLE_NAME}.name AS name,
          ${PET_TABLE_NAME}.status AS status,
          ${PET_TABLE_NAME}.photo AS photo,
          ${PET_TABLE_NAME}.color_level AS color_level,
          ${PET_TABLE_NAME}.animal_tag AS animal_tag,
          ${TASK_TABLE_NAME}.user_id AS user_id,
          ${TASK_TABLE_NAME}.task_template_id AS task_template_id,
          ${TASK_TABLE_NAME}.scheduled_start_time AS scheduled_start_time,
          ${TASK_TABLE_NAME}.start_time AS start_time,
          ${TASK_TABLE_NAME}.end_time AS end_time
        FROM ${PET_TABLE_NAME}
        LEFT JOIN ${TASK_TABLE_NAME} ON ${PET_TABLE_NAME}.id=${TASK_TABLE_NAME}.pet_id`,
        { type: QueryTypes.SELECT },
      );

      const petIdToPetListItem: Record<string, PetListItemDTO> = {};
      // Keep raw maps for volunteer gating
      const petIdToColorLevel: Record<number, number> = {};
      const petIdToAnimalTag: Record<number, AnimalTag> = {};

      // Preload all task templates to avoid multiple queries
      const uniqueTaskTemplateIds = [
        ...new Set(
          petTasks
            .map((pt) => pt.task_template_id)
            .filter((id): id is number => id != null),
        ),
      ];
      const taskTemplates = await TaskTemplate.findAll({
        where: { id: uniqueTaskTemplateIds },
        attributes: ["id", "category"],
      });
      const taskTemplateIdToCategory = new Map<number, TaskCategory>();
      taskTemplates.forEach((tt) => {
        taskTemplateIdToCategory.set(tt.id, tt.category);
      });

      await Promise.all(
        petTasks.map(async (petTask) => {
          // Store pet color level and animal tag for volunteer eligibility checks
          petIdToColorLevel[petTask.pet_id] = petTask.color_level;
          if (petTask.animal_tag) {
            petIdToAnimalTag[petTask.pet_id] = petTask.animal_tag as AnimalTag;
          }

          // Check if task is scheduled for today or started today
          const scheduledTime = petTask.scheduled_start_time
            ? DateTime.fromJSDate(petTask.scheduled_start_time).setZone(
                TIME_ZONE,
              )
            : null;
          const startTime = petTask.start_time
            ? DateTime.fromJSDate(petTask.start_time).setZone(TIME_ZONE)
            : null;

          const isScheduledToday =
            !!scheduledTime &&
            scheduledTime >= beginningOfToday &&
            scheduledTime < endOfToday;
          const isStartedToday =
            !!startTime &&
            startTime >= beginningOfToday &&
            startTime < endOfToday;
          const isToday = isScheduledToday || isStartedToday;

          // Get or create pet data
          let petData = petIdToPetListItem[petTask.pet_id];
          if (!petData) {
            petData = {
              id: petTask.pet_id,
              name: petTask.name,
              photo: petTask.photo,
              color: colorLevelToEnum(petTask.color_level),
              taskCategories: [],
              status: petTask.status,
              lastCaredFor: null,
              allTasksAssigned: null,
              isAssignedToMe: false,
            };
            petIdToPetListItem[petTask.pet_id] = petData;
          }

          // Update lastCaredFor
          // If task is ongoing / pet is occupied
          if (
            petData.status === PetStatus.OCCUPIED ||
            (petTask.start_time && !petTask.end_time)
          ) {
            petData.lastCaredFor = LastCaredFor.OCCUPIED;

            // If task has not started
          } else if (!petTask.end_time && !petTask.start_time) {
            // lastCaredFor stays the same
            // If task has ended
          } else if (petTask.end_time) {
            const endTime = DateTime.fromJSDate(petTask.end_time).setZone(
              TIME_ZONE,
            );

            if (!petData.lastCaredFor) {
              petData.lastCaredFor =
                endTime <= beginningOfToday
                  ? LastCaredFor.ONE_OR_MORE_DAYS_AGO
                  : dateToTimeString(endTime);
            } else if (
              petData.lastCaredFor === LastCaredFor.ONE_OR_MORE_DAYS_AGO
            ) {
              if (endTime > beginningOfToday)
                petData.lastCaredFor = dateToTimeString(endTime);
            } else if (petData.lastCaredFor !== LastCaredFor.OCCUPIED) {
              // convert lastCaredFor to a DateTime for comparison
              const lastCaredForTime = timeStringToDateTime(
                petData.lastCaredFor,
              );
              if (endTime > lastCaredForTime)
                petData.lastCaredFor = dateToTimeString(endTime);
            }
          }

          // Update task information, ONLY for TODAY's incomplete tasks
          if (isToday && !petTask.end_time && petTask.task_template_id) {
            // Get task category from map
            const taskCategory = taskTemplateIdToCategory.get(
              petTask.task_template_id,
            );
            if (!taskCategory) {
              Logger.error(
                `Task template with ID ${petTask.task_template_id} not found.`,
              );
              return;
            }
            // Add task category
            petData.taskCategories.push(taskCategory);

            // Update allTasksAssigned for today's tasks
            if (!petTask.user_id) {
              // If ANY today task is unassigned -> overall false
              petData.allTasksAssigned = false;
            } else if (petData.allTasksAssigned !== false) {
              // Only set true if we never saw a false (all tasks assigned so far)
              petData.allTasksAssigned = true;
            }

            // Update isAssignedToMe for today's tasks
            if (petTask.user_id === user.id) {
              petData.isAssignedToMe = true;
            }
          }
        }),
      );

      // Set allTasksAssigned to null for pets with no tasks today
      const allPets = Object.values(petIdToPetListItem).map((pet) => {
        const hasActiveTasks = pet.taskCategories.length > 0;
        return {
          ...pet,
          // Pets with no tasks today should have allTasksAssigned = null
          allTasksAssigned: hasActiveTasks ? pet.allTasksAssigned : null,
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
