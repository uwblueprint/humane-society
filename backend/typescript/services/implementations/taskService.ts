import { Op, Sequelize, Transaction } from "sequelize";
import { DateTime } from "luxon";
import { sequelize } from "../../models";
import PgTask from "../../models/task.model";
import PgRecurrenceTask from "../../models/recurrence_task.model";
import {
  ITaskService,
  TaskRequestDTO,
  TaskResponseDTO,
  TaskUserPatchDTO,
  TaskTimePatchDTO,
  TaskNotesPatchDTO,
  TaskResponseDTOForDate,
  RecurrenceTaskDTO,
} from "../interfaces/taskService";
import TaskTemplate from "../../models/taskTemplate.model";
import User from "../../models/user.model";
import Pet from "../../models/pet.model";
import {
  BadRequestError,
  getErrorMessage,
  NotFoundError,
} from "../../utilities/errorUtils";
import logger from "../../utilities/logger";
import { Days, InteractionTypeEnum } from "../../types";
import {
  buildStartDates,
  isDateInRecurrence,
  resetDateToUTCMidnight,
} from "../../utilities/dateUtils";
import { getSystemUserId } from "../../utilities/systemUser";
import InteractionService from "./interactionService";

const Logger = logger(__filename);
const TIME_ZONE = "America/New_York";

class TaskService implements ITaskService {
  /* eslint-disable class-methods-use-this */
  async createRecurrence(
    taskId: string,
    cadence: string,
    days?: Days[],
    endDate?: Date,
  ): Promise<RecurrenceTaskDTO> {
    try {
      const task = await PgTask.findByPk(taskId, { raw: true });
      if (!task) {
        throw new NotFoundError(`Task id ${taskId} not found`);
      }

      if (
        endDate &&
        task.scheduled_start_time &&
        resetDateToUTCMidnight(endDate).getTime() <
          resetDateToUTCMidnight(task.scheduled_start_time).getTime()
      )
        throw new Error("End date cannot be before task start date.");
      if (endDate && !task.scheduled_start_time)
        throw new Error(
          "Recurrence task must have a start date if end date is provided.",
        );

      const recurrenceTask = await PgRecurrenceTask.create({
        task_id: taskId,
        ...(days && { days }),
        cadence,
        exclusions: [],
        ...(endDate && { end_date: endDate }),
      });

      return {
        id: recurrenceTask.task_id,
        days: recurrenceTask.days,
        cadence: recurrenceTask.cadence,
        endDate: recurrenceTask.end_date ?? undefined,
        exclusions: recurrenceTask.exclusions,
      };
    } catch (error: unknown) {
      Logger.error(
        `Failed to create recurrence. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  /* eslint-disable class-methods-use-this */
  async getRecurrence(taskId: string): Promise<RecurrenceTaskDTO> {
    try {
      const recurrenceTask = await PgRecurrenceTask.findByPk(taskId, {
        raw: true,
      });
      if (!recurrenceTask) {
        throw new NotFoundError(`Task id ${taskId} not found`);
      }

      return {
        id: recurrenceTask.task_id,
        days: recurrenceTask.days,
        cadence: recurrenceTask.cadence,
        endDate: recurrenceTask.end_date ?? undefined,
        exclusions: recurrenceTask.exclusions,
      };
    } catch (error: unknown) {
      Logger.error(
        `Failed to get recurrence. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  /* eslint-disable class-methods-use-this */
  async updateRecurrence(
    recurrenceId: string,
    updates: Partial<RecurrenceTaskDTO>,
  ): Promise<RecurrenceTaskDTO> {
    try {
      const task = await PgTask.findByPk(recurrenceId, { raw: true });
      const recurrenceTask = await PgRecurrenceTask.findByPk(recurrenceId, {
        raw: true,
      });
      if (!task) throw new NotFoundError(`Task id ${recurrenceId} not found`);
      if (!recurrenceTask)
        throw new NotFoundError(
          `Recurrence for task id ${recurrenceId} not found`,
        );
      if (
        updates.endDate &&
        task.scheduled_start_time &&
        resetDateToUTCMidnight(updates.endDate).getTime() <
          resetDateToUTCMidnight(task.scheduled_start_time).getTime()
      )
        throw new Error("End date cannot be before task start date.");
      if (updates.endDate && !task.scheduled_start_time)
        throw new Error(
          "Recurrence task must have a start date if end date is provided.",
        );

      // normalize it to utc midnight
      const newEndDate = updates.endDate
        ? resetDateToUTCMidnight(updates.endDate)
        : undefined;

      let newExclusions = updates.exclusions ? updates.exclusions : undefined;
      // all exclusions after the end date should be removed
      if (
        recurrenceTask.end_date &&
        newEndDate &&
        (updates.exclusions || recurrenceTask.exclusions) &&
        newEndDate.getTime() < recurrenceTask.end_date.getTime()
      ) {
        const sourceExclusions = (
          updates.exclusions ??
          recurrenceTask.exclusions ??
          []
        ).map((d) => resetDateToUTCMidnight(new Date(d))); // normalize

        newExclusions = newEndDate
          ? sourceExclusions.filter((d) => d.getTime() <= newEndDate.getTime())
          : sourceExclusions;
      }

      let newDays = updates.days ? updates.days : undefined;
      // check if endDate comes before the first occurrence of any of the start days calculated from days array
      if (newEndDate && task.scheduled_start_time) {
        const actualStart = resetDateToUTCMidnight(task.scheduled_start_time);

        // use updated days if provided, otherwise existing
        const sourceDays = updates.days ?? recurrenceTask.days;

        if (sourceDays && sourceDays.length > 0) {
          // prune: keep only days whose first occurrence is on/before endDate
          const prunedDays = sourceDays.filter((day) => {
            const [first] = buildStartDates(actualStart, [day]); // first occurrence for this weekday
            return first.getTime() <= newEndDate.getTime();
          });

          newDays = prunedDays;

          // this shouldn't be happening
          if (prunedDays.length === 0) {
            throw new BadRequestError(
              "End date is before or on the first occurrence of all selected days.",
            );
          }
        }
      }

      const updatedRecurrenceTask = await PgRecurrenceTask.update(
        {
          ...(newDays !== undefined ? { days: newDays } : {}),
          ...(updates.cadence !== undefined
            ? { cadence: updates.cadence }
            : {}),
          ...(newEndDate !== undefined ? { end_date: newEndDate } : {}),
          ...(newExclusions !== undefined ? { exclusions: newExclusions } : {}),
        },
        { where: { task_id: recurrenceId }, returning: true },
      );

      if (updatedRecurrenceTask[0] === 0) {
        throw new NotFoundError(`Recurrence id ${recurrenceId} not found`);
      }

      return {
        id: updatedRecurrenceTask[1][0].task_id,
        days: updatedRecurrenceTask[1][0].days,
        cadence: updatedRecurrenceTask[1][0].cadence,
        endDate: updatedRecurrenceTask[1][0].end_date ?? undefined,
        exclusions: updatedRecurrenceTask[1][0].exclusions,
      };
    } catch (error: unknown) {
      Logger.error(
        `Failed to update recurrence. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  /* eslint-disable class-methods-use-this */
  async deleteRecurrence(recurrenceId: string): Promise<string> {
    try {
      const result = await PgRecurrenceTask.destroy({
        where: { task_id: recurrenceId },
      });

      if (result === 0) {
        throw new NotFoundError(`Recurrence id ${recurrenceId} not found`);
      }

      return recurrenceId;
    } catch (error: unknown) {
      Logger.error(
        `Failed to delete recurrence. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  /* eslint-disable class-methods-use-this */
  async excludeDate(
    recurrenceId: string,
    date: Date,
    transaction?: Transaction,
  ): Promise<RecurrenceTaskDTO> {
    try {
      const recurrenceTask = await PgRecurrenceTask.findByPk(recurrenceId, {
        raw: true,
        transaction,
      });
      const task = await PgTask.findByPk(recurrenceId, {
        raw: true,
        transaction,
      });

      if (!recurrenceTask || !task)
        throw new NotFoundError("Recurrence task/task was not found");
      if (!task.scheduled_start_time)
        throw new NotFoundError("Recurrence task has no start time");

      const exclusion = resetDateToUTCMidnight(date);

      const alreadyExists = recurrenceTask.exclusions?.some(
        (d) =>
          resetDateToUTCMidnight(new Date(d)).getTime() === exclusion.getTime(),
      );

      if (alreadyExists)
        throw new BadRequestError(
          "Exclusion date already exists for this recurrence.",
        );

      const actualStart = resetDateToUTCMidnight(task.scheduled_start_time);
      if (date < actualStart) {
        // throw error because these checks should be done on frontend too
        throw new BadRequestError(
          "Exclusion date is before recurrence start date.",
        );
      }

      if (recurrenceTask.end_date) {
        const end = resetDateToUTCMidnight(recurrenceTask.end_date);
        if (exclusion > end) {
          throw new BadRequestError(
            "Exclusion date is after recurrence end date.",
          );
        }
      }

      let startDates = [actualStart];
      if (recurrenceTask.days && recurrenceTask.days.length > 0) {
        startDates = buildStartDates(actualStart, recurrenceTask.days);
      }

      let validExclusion = exclusion.getTime() === actualStart.getTime();
      if (!validExclusion) {
        // eslint-disable-next-line no-restricted-syntax
        for (const startDate of startDates) {
          if (
            isDateInRecurrence(startDate, exclusion, recurrenceTask.cadence)
          ) {
            validExclusion = true;
            break;
          }
        }
      }

      if (!validExclusion) {
        throw new BadRequestError("An invalid exclusion date was given");
      }

      const updatedExclusions = recurrenceTask.exclusions
        ? [...recurrenceTask.exclusions, date]
        : [date];
      const updatedRecurrenceTask = await PgRecurrenceTask.update(
        {
          exclusions: updatedExclusions,
        },
        { where: { task_id: recurrenceId }, returning: true, transaction },
      );

      return {
        id: updatedRecurrenceTask[1][0].task_id,
        days: updatedRecurrenceTask[1][0].days,
        cadence: updatedRecurrenceTask[1][0].cadence,
        endDate: updatedRecurrenceTask[1][0].end_date ?? undefined,
        exclusions: updatedRecurrenceTask[1][0].exclusions,
      };
    } catch (error: unknown) {
      Logger.error(
        `Failed to exclude date from recurrence. Reason = ${getErrorMessage(
          error,
        )}`,
      );
      throw error;
    }
  }

  /* eslint-disable class-methods-use-this */
  async generateRecurringInstanceForData(
    taskId: string,
    date: Date,
  ): Promise<TaskResponseDTO> {
    try {
      const task = await PgTask.findByPk(taskId, { raw: true });
      const recurrence = await PgRecurrenceTask.findOne({
        where: { task_id: taskId },
        raw: true,
      });
      if (!task || !recurrence)
        throw new NotFoundError(`Task or recurrence not found`);
      if (!task.scheduled_start_time)
        throw new NotFoundError("Recurrence task has no start time");

      const actualStart = new Date(task.scheduled_start_time);
      if (date < resetDateToUTCMidnight(actualStart))
        throw new Error("Date is before recurrence start date.");
      if (recurrence.end_date && date > new Date(recurrence.end_date))
        throw new Error("Date is after recurrence end date.");
      if (
        recurrence.exclusions?.some(
          (ex: Date) =>
            resetDateToUTCMidnight(new Date(ex)).getTime() ===
            resetDateToUTCMidnight(date).getTime(),
        )
      ) {
        throw new Error("Date is excluded from recurrence.");
      }

      let startDates = [actualStart];
      if (recurrence.days && recurrence.days.length > 0) {
        startDates = buildStartDates(actualStart, recurrence.days);
      }

      // eslint-disable-next-line no-restricted-syntax
      for (const startDate of startDates) {
        if (isDateInRecurrence(startDate, date, recurrence.cadence)) {
          const instanceDate = new Date(date);
          instanceDate.setUTCHours(actualStart.getUTCHours());
          instanceDate.setUTCMinutes(actualStart.getUTCMinutes());
          instanceDate.setUTCSeconds(actualStart.getUTCSeconds());
          instanceDate.setUTCMilliseconds(actualStart.getUTCMilliseconds());

          return {
            id: task.id,
            userId: task.user_id,
            petId: task.pet_id,
            taskTemplateId: task.task_template_id,
            scheduledStartTime: instanceDate,
            scheduledEndTime: task.scheduled_end_time,
            startTime: task.start_time,
            endTime: task.end_time,
            notes: task.notes,
          };
        }
      }
      throw new Error("No recurrence instance matches the given date.");
    } catch (error) {
      Logger.error(
        `Failed to generate recurring instance. Reason = ${getErrorMessage(
          error,
        )}`,
      );
      throw error;
    }
  }

  private async materializeOccurrence(
    anchorId: string,
    date: Date,
  ): Promise<PgTask> {
    const anchor = await PgTask.findByPk(anchorId, { raw: true });
    if (!anchor) throw new NotFoundError(`Task id ${anchorId} not found`);

    const occurrenceDay = resetDateToUTCMidnight(date);
    const nextDay = new Date(occurrenceDay.getTime() + 24 * 60 * 60 * 1000);

    const existing = await PgTask.findOne({
      raw: true,
      where: {
        pet_id: anchor.pet_id,
        task_template_id: anchor.task_template_id,
        scheduled_start_time: { [Op.gte]: occurrenceDay, [Op.lt]: nextDay },
        "$recurrence.task_id$": { [Op.is]: null },
      },
      include: [{ model: PgRecurrenceTask, required: false }],
    });
    if (existing) return existing;

    const durationMs =
      anchor.scheduled_start_time && anchor.scheduled_end_time
        ? anchor.scheduled_end_time.getTime() -
          anchor.scheduled_start_time.getTime()
        : undefined;

    // preserve the anchor's original time-of-day on the occurrence's date,
    // same as generateRecurringInstanceForData does for the virtual instance
    const instanceStartTime = new Date(occurrenceDay);
    if (anchor.scheduled_start_time) {
      instanceStartTime.setUTCHours(anchor.scheduled_start_time.getUTCHours());
      instanceStartTime.setUTCMinutes(
        anchor.scheduled_start_time.getUTCMinutes(),
      );
      instanceStartTime.setUTCSeconds(
        anchor.scheduled_start_time.getUTCSeconds(),
      );
      instanceStartTime.setUTCMilliseconds(
        anchor.scheduled_start_time.getUTCMilliseconds(),
      );
    }

    const transaction = await sequelize.transaction();
    try {
      await this.excludeDate(anchorId, date, transaction);

      const newTask = await this.createTask(
        {
          userId: anchor.user_id,
          petId: anchor.pet_id,
          taskTemplateId: anchor.task_template_id,
          scheduledStartTime: instanceStartTime,
          scheduledEndTime:
            durationMs !== undefined
              ? new Date(instanceStartTime.getTime() + durationMs)
              : undefined,
          notes: anchor.notes,
        },
        transaction,
      );

      await transaction.commit();

      const materializedTask = await PgTask.findByPk(newTask.id, {
        raw: true,
      });
      if (!materializedTask) {
        throw new NotFoundError(`Task id ${newTask.id} not found`);
      }
      return materializedTask;
    } catch (error: unknown) {
      await transaction.rollback();
      throw error;
    }
  }

  /* eslint-disable class-methods-use-this */
  async getTask(id: string): Promise<TaskResponseDTO> {
    let task: PgTask | null;
    try {
      task = await PgTask.findByPk(id, { raw: true });
      if (!task) {
        throw new NotFoundError(`Task id ${id} not found`);
      }
    } catch (error: unknown) {
      Logger.error(`Failed to get task. Reason = ${getErrorMessage(error)}`);
      throw error;
    }

    return {
      id: task.id,
      userId: task.user_id,
      petId: task.pet_id,
      taskTemplateId: task.task_template_id,
      scheduledStartTime: task.scheduled_start_time,
      scheduledEndTime: task.scheduled_end_time,
      startTime: task.start_time,
      endTime: task.end_time,
      notes: task.notes,
    };
  }

  /**
   * Lazily reconciles standalone (non-recurring, or already-materialized)
   * task rows on read: unassigns tasks whose scheduled window has passed
   * with nobody having started/completed them, and logs a task as
   * incomplete once its scheduled start day has passed with no end time.
   * Both are self-guarded conditional updates, so a row can only ever
   * fire once each - safe to call on every read.
   */
  /* eslint-disable class-methods-use-this */
  private isTaskIncomplete(
    task: Pick<
      PgTask,
      "end_time" | "incomplete_logged_at" | "scheduled_start_time"
    >,
    today: DateTime,
  ): boolean {
    return (
      !task.end_time &&
      !task.incomplete_logged_at &&
      !!task.scheduled_start_time &&
      DateTime.fromJSDate(task.scheduled_start_time)
        .setZone(TIME_ZONE)
        .startOf("day") < today
    );
  }

  /* eslint-disable class-methods-use-this */
  private isTaskStaleAssignment(
    task: Pick<
      PgTask,
      "start_time" | "end_time" | "user_id" | "scheduled_end_time"
    >,
    now: Date,
  ): boolean {
    return (
      !task.start_time &&
      !task.end_time &&
      task.user_id != null &&
      !!task.scheduled_end_time &&
      task.scheduled_end_time.getTime() < now.getTime()
    );
  }

  private async reconcileLazyTaskStates(tasks: PgTask[]): Promise<PgTask[]> {
    const now = new Date();
    const today = DateTime.now().setZone(TIME_ZONE).startOf("day");

    const isIncomplete = (task: PgTask): boolean =>
      this.isTaskIncomplete(task, today);

    const isStaleAssignment = (task: PgTask): boolean =>
      this.isTaskStaleAssignment(task, now);

    const staleTasks = tasks.filter(
      (task) => isIncomplete(task) || isStaleAssignment(task),
    );

    if (staleTasks.length === 0) return tasks;

    const taskTemplateIds = [
      ...new Set(staleTasks.map((task) => task.task_template_id)),
    ];
    const petIds = [...new Set(staleTasks.map((task) => task.pet_id))];
    const userIds = [
      ...new Set(
        staleTasks
          .map((task) => task.user_id)
          .filter((id): id is number => id != null),
      ),
    ];

    const [taskTemplates, pets, users] = await Promise.all([
      TaskTemplate.findAll({
        where: { id: { [Op.in]: taskTemplateIds } },
        raw: true,
      }),
      Pet.findAll({ where: { id: { [Op.in]: petIds } }, raw: true }),
      userIds.length > 0
        ? User.findAll({ where: { id: { [Op.in]: userIds } }, raw: true })
        : Promise.resolve([]),
    ]);

    const taskTemplateNameById = new Map(
      taskTemplates.map((taskTemplate) => [
        taskTemplate.id,
        taskTemplate.task_name,
      ]),
    );
    const petNameById = new Map(pets.map((pet) => [pet.id, pet.name]));
    const userNameById = new Map(
      users.map((user) => [user.id, `${user.first_name} ${user.last_name}`]),
    );

    const systemUserId = await getSystemUserId();
    const updatedById = new Map<number, PgTask>();

    await Promise.all(
      staleTasks.map(async (task) => {
        const taskTemplateName = taskTemplateNameById.get(
          task.task_template_id,
        );
        const petName = petNameById.get(task.pet_id);
        const oldUserName =
          task.user_id != null ? userNameById.get(task.user_id) : undefined;

        let current = task;

        if (isIncomplete(current)) {
          const [affected] = await PgTask.update(
            { incomplete_logged_at: now },
            {
              where: {
                id: current.id,
                incomplete_logged_at: { [Op.is]: null },
              },
            },
          );
          if (affected > 0) {
            current = { ...current, incomplete_logged_at: now } as PgTask;
            const interactionTypeId =
              await InteractionService.getInteractionTypeId(
                InteractionTypeEnum.MARKED_TASK_INCOMPLETE,
              );
            await InteractionService.log({
              actorId: systemUserId,
              targetUserId: null,
              targetPetId: null,
              targetTaskId: current.id,
              targetTaskTemplateId: null,
              interactionTypeId,
              metadata: [],
              short_description: `${taskTemplateName} is an incomplete task with ${petName}`,
              long_description: oldUserName
                ? `${taskTemplateName} is an incomplete task. It was last assigned to ${oldUserName}.`
                : `${taskTemplateName} is an incomplete task. Nobody was assigned this task.`,
            });
          }
        }

        if (isStaleAssignment(current)) {
          const [affected] = await PgTask.update(
            { user_id: null },
            {
              where: {
                id: current.id,
                user_id: { [Op.ne]: null },
                start_time: { [Op.is]: null },
                end_time: { [Op.is]: null },
              },
            },
          );
          if (affected > 0) {
            current = { ...current, user_id: undefined } as PgTask;
            const interactionTypeId =
              await InteractionService.getInteractionTypeId(
                InteractionTypeEnum.MARKED_TASK_INACTIVE,
              );
            await InteractionService.log({
              actorId: systemUserId,
              targetUserId: null,
              targetPetId: null,
              targetTaskId: current.id,
              targetTaskTemplateId: null,
              interactionTypeId,
              metadata: [],
              short_description: `${taskTemplateName} is an inactive task with ${petName}`,
              long_description: `${taskTemplateName} is an inactive task. It was last assigned to ${
                oldUserName ?? "N/A"
              }`,
            });
          }
        }

        updatedById.set(task.id, current);
      }),
    );

    return tasks.map((task) => updatedById.get(task.id) ?? task);
  }

  async getTasks(): Promise<TaskResponseDTO[]> {
    try {
      const tasks: Array<PgTask> = await this.reconcileLazyTaskStates(
        await PgTask.findAll({
          where: { "$recurrence.task_id$": { [Op.is]: null } },
          include: [{ model: PgRecurrenceTask, required: false }],
          raw: true,
        }),
      );
      return tasks.map((task) => ({
        id: task.id,
        userId: task.user_id,
        petId: task.pet_id,
        taskTemplateId: task.task_template_id,
        scheduledStartTime: task.scheduled_start_time,
        scheduledEndTime: task.scheduled_end_time,
        startTime: task.start_time,
        endTime: task.end_time,
        notes: task.notes,
      }));
    } catch (error: unknown) {
      Logger.error(
        `Failed to get activites. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  async getPetTasks(pet_id: string): Promise<Array<TaskResponseDTO>> {
    try {
      const fetchedTasks: Array<PgTask> = await PgTask.findAll({
        where: {
          pet_id,
          "$recurrence.task_id$": { [Op.is]: null },
        },
        include: [{ model: PgRecurrenceTask, required: false }],
        raw: true,
      });
      if (!fetchedTasks[0]) {
        throw new NotFoundError(`No tasks for pet id ${pet_id}`);
      }
      const tasks = await this.reconcileLazyTaskStates(fetchedTasks);
      return tasks.map((task) => ({
        id: task.id,
        userId: task.user_id,
        petId: task.pet_id,
        taskTemplateId: task.task_template_id,
        scheduledStartTime: task.scheduled_start_time,
        scheduledEndTime: task.scheduled_end_time,
        startTime: task.start_time,
        endTime: task.end_time,
        notes: task.notes,
      }));
    } catch (error: unknown) {
      Logger.error(
        `Failed to get activites. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  async getUserTasks(user_id: string): Promise<Array<TaskResponseDTO>> {
    try {
      const fetchedTasks: Array<PgTask> = await PgTask.findAll({
        where: {
          user_id,
          "$recurrence.task_id$": { [Op.is]: null },
        },
        include: [{ model: PgRecurrenceTask, required: false }],
        raw: true,
      });
      if (!fetchedTasks[0]) {
        throw new NotFoundError(`No tasks for user id ${user_id}`);
      }
      const reconciledTasks = await this.reconcileLazyTaskStates(fetchedTasks);
      // a task reconciled into unassigned no longer belongs to this user
      const tasks = reconciledTasks.filter(
        (task) => String(task.user_id) === user_id,
      );
      return tasks.map((task) => ({
        id: task.id,
        userId: task.user_id,
        petId: task.pet_id,
        taskTemplateId: task.task_template_id,
        scheduledStartTime: task.scheduled_start_time,
        scheduledEndTime: task.scheduled_end_time,
        startTime: task.start_time,
        endTime: task.end_time,
        notes: task.notes,
      }));
    } catch (error: unknown) {
      Logger.error(
        `Failed to get activites. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  async createTask(
    task: TaskRequestDTO,
    transaction?: Transaction,
  ): Promise<TaskResponseDTO> {
    let newTask: PgTask | null;
    try {
      newTask = await PgTask.create(
        {
          user_id: task.userId,
          pet_id: task.petId,
          task_template_id: task.taskTemplateId,
          scheduled_start_time: task.scheduledStartTime,
          scheduled_end_time: task.scheduledEndTime,
          start_time: task.startTime,
          end_time: task.endTime,
          notes: task.notes,
        },
        { transaction },
      );
    } catch (error: unknown) {
      Logger.error(`Failed to create task. Reason = ${getErrorMessage(error)}`);
      throw error;
    }
    return {
      id: newTask.id,
      userId: newTask.user_id,
      petId: newTask.pet_id,
      taskTemplateId: newTask.task_template_id,
      scheduledStartTime: newTask.scheduled_start_time,
      scheduledEndTime: newTask.scheduled_end_time,
      startTime: newTask.start_time,
      endTime: newTask.end_time,
      notes: newTask.notes,
    };
  }

  async updateTask(
    id: string,
    task: TaskRequestDTO,
  ): Promise<TaskResponseDTO | null> {
    let resultingTask: PgTask | null;
    let updateResult: [number, PgTask[]] | null;
    try {
      const isFutureStart =
        !!task.scheduledStartTime &&
        new Date(task.scheduledStartTime).getTime() > Date.now();
      updateResult = await PgTask.update(
        {
          user_id: task.userId,
          pet_id: task.petId,
          task_template_id: task.taskTemplateId,
          scheduled_start_time: task.scheduledStartTime,
          scheduled_end_time: task.scheduledEndTime,
          start_time: task.startTime,
          end_time: task.endTime,
          notes: task.notes,
          ...(isFutureStart ? { incomplete_logged_at: null } : {}),
        },
        { where: { id }, returning: true },
      );

      if (!updateResult[0]) {
        throw new NotFoundError(`Task id ${id} not found`);
      }
      [, [resultingTask]] = updateResult;
    } catch (error: unknown) {
      Logger.error(`Failed to update task. Reason = ${getErrorMessage(error)}`);
      throw error;
    }
    return {
      id: resultingTask.id,
      userId: resultingTask.user_id,
      petId: resultingTask.pet_id,
      taskTemplateId: resultingTask.task_template_id,
      scheduledStartTime: resultingTask.scheduled_start_time,
      scheduledEndTime: resultingTask.scheduled_end_time,
      startTime: resultingTask.start_time,
      endTime: resultingTask.end_time,
      notes: resultingTask.notes,
    };
  }

  async assignUser(
    id: string,
    user: TaskUserPatchDTO,
  ): Promise<TaskResponseDTO | null> {
    let resultingTask: PgTask | null;
    let updateResult: [number, PgTask[]] | null;
    try {
      updateResult = await PgTask.update(
        {
          user_id: user.userId,
        },
        { where: { id }, returning: true },
      );

      if (!updateResult[0]) {
        throw new NotFoundError(`Task id ${id} not found`);
      }
      [, [resultingTask]] = updateResult;
    } catch (error: unknown) {
      Logger.error(`Failed to update task. Reason = ${getErrorMessage(error)}`);
      throw error;
    }
    return {
      id: resultingTask.id,
      userId: resultingTask.user_id,
      petId: resultingTask.pet_id,
      taskTemplateId: resultingTask.task_template_id,
      scheduledStartTime: resultingTask.scheduled_start_time,
      scheduledEndTime: resultingTask.scheduled_end_time,
      startTime: resultingTask.start_time,
      endTime: resultingTask.end_time,
      notes: resultingTask.notes,
    };
  }

  async scheduleTask(
    id: string,
    schedule: TaskTimePatchDTO,
  ): Promise<TaskResponseDTO | null> {
    let resultingTask: PgTask | null;
    let updateResult: [number, PgTask[]] | null;
    try {
      const isFutureStart = new Date(schedule.time).getTime() > Date.now();
      updateResult = await PgTask.update(
        {
          scheduled_start_time: schedule.time,
          ...(isFutureStart ? { incomplete_logged_at: null } : {}),
        },
        { where: { id }, returning: true },
      );

      if (!updateResult[0]) {
        throw new NotFoundError(`Task id ${id} not found`);
      }
      [, [resultingTask]] = updateResult;
    } catch (error: unknown) {
      Logger.error(`Failed to update task. Reason = ${getErrorMessage(error)}`);
      throw error;
    }
    return {
      id: resultingTask.id,
      userId: resultingTask.user_id,
      petId: resultingTask.pet_id,
      taskTemplateId: resultingTask.task_template_id,
      scheduledStartTime: resultingTask.scheduled_start_time,
      scheduledEndTime: resultingTask.scheduled_end_time,
      startTime: resultingTask.start_time,
      endTime: resultingTask.end_time,
      notes: resultingTask.notes,
    };
  }

  async startTask(
    id: string,
    startTime: TaskTimePatchDTO,
  ): Promise<TaskResponseDTO | null> {
    let resultingTask: PgTask | null;
    let updateResult: [number, PgTask[]] | null;
    try {
      updateResult = await PgTask.update(
        {
          start_time: startTime.time,
        },
        { where: { id }, returning: true },
      );

      if (!updateResult[0]) {
        throw new NotFoundError(`Task id ${id} not found`);
      }
      [, [resultingTask]] = updateResult;
    } catch (error: unknown) {
      Logger.error(`Failed to update task. Reason = ${getErrorMessage(error)}`);
      throw error;
    }
    return {
      id: resultingTask.id,
      userId: resultingTask.user_id,
      petId: resultingTask.pet_id,
      taskTemplateId: resultingTask.task_template_id,
      scheduledStartTime: resultingTask.scheduled_start_time,
      scheduledEndTime: resultingTask.scheduled_end_time,
      startTime: resultingTask.start_time,
      endTime: resultingTask.end_time,
      notes: resultingTask.notes,
    };
  }

  async endTask(
    id: string,
    endTime: TaskTimePatchDTO,
  ): Promise<TaskResponseDTO | null> {
    let resultingTask: PgTask | null;
    let updateResult: [number, PgTask[]] | null;
    try {
      updateResult = await PgTask.update(
        {
          end_time: endTime.time,
        },
        { where: { id }, returning: true },
      );

      if (!updateResult[0]) {
        throw new NotFoundError(`Task id ${id} not found`);
      }
      [, [resultingTask]] = updateResult;
    } catch (error: unknown) {
      Logger.error(`Failed to update task. Reason = ${getErrorMessage(error)}`);
      throw error;
    }
    return {
      id: resultingTask.id,
      userId: resultingTask.user_id,
      petId: resultingTask.pet_id,
      taskTemplateId: resultingTask.task_template_id,
      scheduledStartTime: resultingTask.scheduled_start_time,
      scheduledEndTime: resultingTask.scheduled_end_time,
      startTime: resultingTask.start_time,
      endTime: resultingTask.end_time,
      notes: resultingTask.notes,
    };
  }

  async updateTaskNotes(
    id: string,
    notes: TaskNotesPatchDTO,
  ): Promise<TaskResponseDTO | null> {
    let resultingTask: PgTask | null;
    let updateResult: [number, PgTask[]] | null;
    try {
      updateResult = await PgTask.update(
        {
          notes: notes.notes,
        },
        { where: { id }, returning: true },
      );

      if (!updateResult[0]) {
        throw new NotFoundError(`Task id ${id} not found`);
      }
      [, [resultingTask]] = updateResult;
    } catch (error: unknown) {
      Logger.error(`Failed to update task. Reason = ${getErrorMessage(error)}`);
      throw error;
    }
    return {
      id: resultingTask.id,
      userId: resultingTask.user_id,
      petId: resultingTask.pet_id,
      taskTemplateId: resultingTask.task_template_id,
      scheduledStartTime: resultingTask.scheduled_start_time,
      scheduledEndTime: resultingTask.scheduled_end_time,
      startTime: resultingTask.start_time,
      endTime: resultingTask.end_time,
      notes: resultingTask.notes,
    };
  }

  async deleteTask(id: string): Promise<string> {
    try {
      const deleteResult: number | null = await PgTask.destroy({
        where: { id },
      });
      if (!deleteResult) {
        throw new NotFoundError(`Task id ${id} not found`);
      }
      return id;
    } catch (error: unknown) {
      Logger.error(`Failed to delete task. Reason = ${getErrorMessage(error)}`);
      throw error;
    }
  }

  async getTasksForDate(
    date: string,
    filters?: { userId?: number; petId?: number },
  ): Promise<TaskResponseDTOForDate[]> {
    try {
      const selectedDate = DateTime.fromISO(date, { zone: TIME_ZONE });
      if (!selectedDate.isValid) {
        throw new Error(`Invalid date format: ${date}`);
      }

      const beginningOfDay = selectedDate.startOf("day").toJSDate();
      const endOfDay = selectedDate.plus({ days: 1 }).startOf("day").toJSDate();

      const whereClause: Record<string, unknown> = {
        scheduled_start_time: {
          [Op.gte]: beginningOfDay,
          [Op.lt]: endOfDay,
        },
      };

      if (filters?.userId !== undefined) {
        whereClause.user_id = filters.userId;
      }

      if (filters?.petId !== undefined) {
        whereClause.pet_id = filters.petId;
      }

      const oneTimeTasks: Array<PgTask> = await PgTask.findAll({
        where: {
          ...whereClause,
          "$recurrence.task_id$": { [Op.is]: null },
        },
        include: [
          { model: PgRecurrenceTask, required: false },
          { model: TaskTemplate, attributes: ["task_name", "category"] },
          {
            model: User,
            attributes: ["id", "first_name", "last_name", "profile_photo"],
            required: false,
          },
          { model: Pet, attributes: ["name"], required: false },
        ],
      });

      const reconciledOneTimeTasks = await this.reconcileLazyTaskStates(
        oneTimeTasks,
      );
      const reconciledUserIdById = new Map(
        reconciledOneTimeTasks.map((task) => [task.id, task.user_id]),
      );

      const oneTimeTasksWithFlag: TaskResponseDTOForDate[] = oneTimeTasks.map(
        (task) => {
          const isStillAssigned =
            (reconciledUserIdById.get(task.id) ?? task.user_id) != null;
          return {
            id: task.id,
            userId: isStillAssigned ? task.user_id : undefined,
            petId: task.pet_id,
            taskTemplateId: task.task_template_id,
            scheduledStartTime: task.scheduled_start_time,
            scheduledEndTime: task.scheduled_end_time,
            startTime: task.start_time,
            endTime: task.end_time,
            notes: task.notes,
            isRecurring: false,
            taskName: task.task_template?.task_name,
            category: task.task_template?.category,
            petName: task.pet?.name,
            assignedUser:
              isStillAssigned && task.user
                ? {
                    id: task.user.id,
                    firstName: task.user.first_name,
                    lastName: task.user.last_name,
                    profilePhoto: task.user.profile_photo,
                  }
                : null,
          };
        },
      );

      const recurringWhereClause: Record<string, unknown> = {};
      if (filters?.userId !== undefined) {
        recurringWhereClause.user_id = filters.userId;
      }
      if (filters?.petId !== undefined) {
        recurringWhereClause.pet_id = filters.petId;
      }

      const recurringTasks = await PgTask.findAll({
        where: recurringWhereClause,
        include: [{ model: PgRecurrenceTask, required: true }],
      });

      const selectedDateObj = resetDateToUTCMidnight(beginningOfDay);
      const now = new Date();
      const today = DateTime.now().setZone(TIME_ZONE).startOf("day");

      const results = await Promise.all(
        recurringTasks.map((task) =>
          this.generateRecurringInstanceForData(task.id, selectedDateObj)
            .then(async (instance): Promise<TaskResponseDTOForDate> => {
              const anchorDurationMs =
                task.scheduled_start_time && task.scheduled_end_time
                  ? task.scheduled_end_time.getTime() -
                    task.scheduled_start_time.getTime()
                  : undefined;
              const occurrenceEndTime =
                anchorDurationMs !== undefined && instance.scheduledStartTime
                  ? new Date(
                      instance.scheduledStartTime.getTime() + anchorDurationMs,
                    )
                  : instance.scheduledEndTime;

              const isStale =
                this.isTaskIncomplete(
                  {
                    end_time: instance.endTime,
                    incomplete_logged_at: undefined,
                    scheduled_start_time: instance.scheduledStartTime,
                  },
                  today,
                ) ||
                this.isTaskStaleAssignment(
                  {
                    start_time: instance.startTime,
                    end_time: instance.endTime,
                    user_id: instance.userId,
                    scheduled_end_time: occurrenceEndTime,
                  },
                  now,
                );

              if (!isStale) {
                return { ...instance, isRecurring: true };
              }

              const materialized = await this.materializeOccurrence(
                task.id.toString(),
                selectedDateObj,
              );
              const [reconciled] = await this.reconcileLazyTaskStates([
                materialized,
              ]);
              return {
                id: reconciled.id,
                userId: reconciled.user_id,
                petId: reconciled.pet_id,
                taskTemplateId: reconciled.task_template_id,
                scheduledStartTime: reconciled.scheduled_start_time,
                scheduledEndTime: reconciled.scheduled_end_time,
                startTime: reconciled.start_time,
                endTime: reconciled.end_time,
                notes: reconciled.notes,
                isRecurring: true,
              };
            })
            .catch(() => null),
        ),
      );

      const recurringInstances = results.filter(
        (r): r is TaskResponseDTOForDate => r !== null,
      );

      // Enrich recurring instances with task name, category, assigned user, profile photo
      const recurringTaskIds = recurringInstances.map((r) => r.id);
      const enrichedRecurringTasks =
        recurringTaskIds.length > 0
          ? await PgTask.findAll({
              where: { id: recurringTaskIds },
              include: [
                { model: TaskTemplate, attributes: ["task_name", "category"] },
                {
                  model: User,
                  attributes: [
                    "id",
                    "first_name",
                    "last_name",
                    "profile_photo",
                  ],
                  required: false,
                },
                { model: Pet, attributes: ["name"], required: false },
              ],
            })
          : [];

      const enrichmentMap = new Map(
        enrichedRecurringTasks.map((t) => [t.id, t]),
      );

      const enrichedRecurringInstances: TaskResponseDTOForDate[] =
        recurringInstances.map((instance) => {
          const enriched = enrichmentMap.get(instance.id);
          return {
            ...instance,
            taskName: enriched?.task_template?.task_name,
            category: enriched?.task_template?.category,
            petName: enriched?.pet?.name,
            assignedUser: enriched?.user
              ? {
                  id: enriched.user.id,
                  firstName: enriched.user.first_name,
                  lastName: enriched.user.last_name,
                  profilePhoto: enriched.user.profile_photo,
                }
              : null,
          };
        });

      // Deduplicate: recurring tasks whose start date falls on the selected date
      const recurringInstanceIds = new Set(
        enrichedRecurringInstances.map((r) => r.id),
      );
      const filteredOneTimeTasks = oneTimeTasksWithFlag.filter(
        (task) => !recurringInstanceIds.has(task.id),
      );

      return [...filteredOneTimeTasks, ...enrichedRecurringInstances];
    } catch (error: unknown) {
      Logger.error(
        `Failed to get tasks for date. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  async deleteFutureTasks(
    taskTemplateId: number,
    petId: number,
    date: Date,
    excludeTaskId?: number,
  ): Promise<void> {
    try {
      const normalizedDate = resetDateToUTCMidnight(date);
      const idConditions: unknown[] = [
        {
          [Op.notIn]: Sequelize.literal(
            "(SELECT task_id FROM recurrence_tasks)",
          ),
        },
      ];

      if (excludeTaskId) {
        idConditions.push({ [Op.ne]: excludeTaskId });
      }

      await PgTask.destroy({
        where: {
          task_template_id: taskTemplateId,
          pet_id: petId,
          scheduled_start_time: {
            [Op.gte]: normalizedDate,
          },
          id: { [Op.and]: idConditions },
        },
      });
    } catch (error: unknown) {
      Logger.error(
        `Failed to delete future tasks. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
  }
}

export default TaskService;
