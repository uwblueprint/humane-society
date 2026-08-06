import { Op, Transaction } from "sequelize";
import { DateTime } from "luxon";
import PgTask from "../../models/task.model";
import PgRecurrenceTask from "../../models/recurrence_task.model";
import { sequelize } from "../../models";
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
import { Cadence, Days } from "../../types";
import {
  buildStartDates,
  buildShelterInstant,
  matchesRecurrenceRule,
  resetDateToShelterMidnight,
  resetDateToUTCMidnight,
} from "../../utilities/dateUtils";
import { requirePetAndTemplateIds } from "../../utilities/common";
import {
  isTaskIncomplete,
  isTaskStaleAssignment,
  reconcileLazyTaskStates,
} from "./taskStaleStateReconciler";

const Logger = logger(__filename);
const TIME_ZONE = "America/New_York";

class TaskService implements ITaskService {
  /* eslint-disable class-methods-use-this */
  async createRecurrence(
    taskId: string,
    cadence: string,
    days?: Days[],
    endDate?: Date,
    exclusions?: Date[],
    transaction?: Transaction,
  ): Promise<RecurrenceTaskDTO> {
    try {
      const task = await PgTask.findByPk(taskId, { raw: true, transaction });
      if (!task) {
        throw new NotFoundError(`Task id ${taskId} not found`);
      }

      if (
        endDate &&
        task.scheduled_start_time &&
        resetDateToUTCMidnight(endDate).getTime() <
          resetDateToUTCMidnight(task.scheduled_start_time).getTime()
      )
        throw new BadRequestError("End date cannot be before task start date.");
      if (endDate && !task.scheduled_start_time)
        throw new BadRequestError(
          "Recurrence task must have a start date if end date is provided.",
        );

      const recurrenceTask = await PgRecurrenceTask.create(
        {
          task_id: taskId,
          ...(days && { days }),
          cadence,
          exclusions: exclusions ?? [],
          ...(endDate && { end_date: endDate }),
        },
        { transaction },
      );

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
    transaction?: Transaction,
  ): Promise<RecurrenceTaskDTO> {
    try {
      const task = await PgTask.findByPk(recurrenceId, {
        raw: true,
        transaction,
      });
      const recurrenceTask = await PgRecurrenceTask.findByPk(recurrenceId, {
        raw: true,
        transaction,
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
        throw new BadRequestError("End date cannot be before task start date.");
      if (updates.endDate && !task.scheduled_start_time)
        throw new BadRequestError(
          "Recurrence task must have a start date if end date is provided.",
        );

      const isClearingEndDate =
        "endDate" in updates && updates.endDate === null;

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

          if (prunedDays.length === 0) {
            const baseExclusions =
              newExclusions ?? recurrenceTask.exclusions ?? [];
            newExclusions = [...baseExclusions, actualStart];
          }

          newDays = prunedDays;
        }
      }

      let endDateUpdate: { end_date: Date | null } | Record<string, never> = {};
      if (newEndDate !== undefined) {
        endDateUpdate = { end_date: newEndDate };
      } else if (isClearingEndDate) {
        endDateUpdate = { end_date: null };
      }

      const updatedRecurrenceTask = await PgRecurrenceTask.update(
        {
          ...(newDays !== undefined ? { days: newDays } : {}),
          ...(updates.cadence !== undefined
            ? { cadence: updates.cadence }
            : {}),
          ...endDateUpdate,
          ...(newExclusions !== undefined ? { exclusions: newExclusions } : {}),
        },
        { where: { task_id: recurrenceId }, returning: true, transaction },
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

      const validExclusion = matchesRecurrenceRule(
        actualStart,
        exclusion,
        recurrenceTask,
      );

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
      const anchorDayLabel = resetDateToShelterMidnight(actualStart);
      if (!matchesRecurrenceRule(anchorDayLabel, date, recurrence)) {
        throw new Error(
          "Given date does not match the recurrence rule (before the start date, after the end date, excluded, or off-pattern).",
        );
      }

      const occurrenceDate = buildShelterInstant(date, actualStart);
      const occurrenceEndDate = task.scheduled_end_time
        ? new Date(
            occurrenceDate.getTime() +
              (new Date(task.scheduled_end_time).getTime() -
                actualStart.getTime()),
          )
        : task.scheduled_end_time;

      const shadow = await PgTask.findOne({
        where: {
          origin_task_id: task.id,
          occurrence_date: resetDateToUTCMidnight(date),
        },
        raw: true,
      });

      return {
        id: task.id,
        userId: (shadow ? shadow.user_id : task.user_id) ?? undefined,
        ...requirePetAndTemplateIds(task),
        scheduledStartTime: occurrenceDate,
        scheduledEndTime: occurrenceEndDate,
        startTime: (shadow ? shadow.start_time : task.start_time) ?? undefined,
        endTime: (shadow ? shadow.end_time : task.end_time) ?? undefined,
        notes: task.notes,
      };
    } catch (error) {
      Logger.error(
        `Failed to generate recurring instance. Reason = ${getErrorMessage(
          error,
        )}`,
      );
      throw error;
    }
  }

  async getTask(id: string, date?: Date): Promise<TaskResponseDTO> {
    if (date) {
      const recurrence = await PgRecurrenceTask.findOne({
        where: { task_id: id },
      });
      if (recurrence) {
        return this.generateRecurringInstanceForData(
          id,
          resetDateToUTCMidnight(date),
        );
      }
    }

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
      ...requirePetAndTemplateIds(task),
      scheduledStartTime: task.scheduled_start_time,
      scheduledEndTime: task.scheduled_end_time,
      startTime: task.start_time,
      endTime: task.end_time,
      notes: task.notes,
    };
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
      ...requirePetAndTemplateIds(newTask),
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
    transaction?: Transaction,
  ): Promise<TaskResponseDTO | null> {
    let resultingTask: PgTask | null;
    let updateResult: [number, PgTask[]] | null;
    try {
      const isStartDayNotPast =
        !!task.scheduledStartTime &&
        DateTime.fromJSDate(new Date(task.scheduledStartTime))
          .setZone(TIME_ZONE)
          .startOf("day") >= DateTime.now().setZone(TIME_ZONE).startOf("day");
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
          ...(isStartDayNotPast ? { incomplete_logged_at: null } : {}),
        },
        { where: { id }, returning: true, transaction },
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
      ...requirePetAndTemplateIds(resultingTask),
      scheduledStartTime: resultingTask.scheduled_start_time,
      scheduledEndTime: resultingTask.scheduled_end_time,
      startTime: resultingTask.start_time,
      endTime: resultingTask.end_time,
      notes: resultingTask.notes,
    };
  }

  private async forkRecurrenceWithNewAssignee(
    taskId: string,
    splitDate: Date,
    newUserId: number | null,
    transaction: Transaction,
  ): Promise<PgTask> {
    const task = await PgTask.findByPk(taskId, { transaction });
    if (!task) throw new NotFoundError(`Task id ${taskId} not found`);
    if (!task.scheduled_start_time) {
      throw new NotFoundError("Given task has no start date");
    }
    const recurrence = await PgRecurrenceTask.findOne({
      where: { task_id: taskId },
      transaction,
    });
    if (!recurrence) {
      throw new NotFoundError(`Recurrence for task id ${taskId} not found`);
    }

    const newRecurrenceEndDate = new Date(
      resetDateToUTCMidnight(splitDate).getTime() - 24 * 60 * 60 * 1000,
    );
    await this.updateRecurrence(
      taskId,
      { endDate: newRecurrenceEndDate },
      transaction,
    );

    let newScheduledEndTime: Date | undefined;
    if (task.scheduled_end_time) {
      const seedEnd = new Date(task.scheduled_end_time);
      newScheduledEndTime = new Date(splitDate);
      newScheduledEndTime.setUTCHours(
        seedEnd.getUTCHours(),
        seedEnd.getUTCMinutes(),
        seedEnd.getUTCSeconds(),
        seedEnd.getUTCMilliseconds(),
      );
    }

    const newTaskDTO = await this.createTask(
      {
        userId: newUserId ?? undefined,
        ...requirePetAndTemplateIds(task),
        scheduledStartTime: splitDate,
        scheduledEndTime: newScheduledEndTime,
        notes: task.notes,
      },
      transaction,
    );

    const carriedExclusions = (recurrence.exclusions ?? []).filter(
      (ex) =>
        resetDateToUTCMidnight(new Date(ex)).getTime() >
        resetDateToUTCMidnight(splitDate).getTime(),
    );

    const newRecurrenceDTO = await this.createRecurrence(
      newTaskDTO.id.toString(),
      recurrence.cadence,
      recurrence.days,
      recurrence.end_date ?? undefined,
      carriedExclusions,
      transaction,
    );

    await this.reconcileShadows(
      taskId,
      resetDateToUTCMidnight(task.scheduled_start_time),
      {
        days: recurrence.days,
        cadence: recurrence.cadence,
        end_date: newRecurrenceEndDate,
        exclusions: recurrence.exclusions,
      },
      newTaskDTO.id.toString(),
      splitDate,
      {
        days: newRecurrenceDTO.days,
        cadence: newRecurrenceDTO.cadence,
        end_date: newRecurrenceDTO.endDate,
        exclusions: newRecurrenceDTO.exclusions,
      },
      transaction,
    );

    const newTask = await PgTask.findByPk(newTaskDTO.id, { transaction });
    if (!newTask) {
      throw new NotFoundError(`Task id ${newTaskDTO.id} not found`);
    }
    return newTask;
  }

  async assignUser(
    id: string,
    user: TaskUserPatchDTO,
    occurrenceDate?: Date,
    single = true,
  ): Promise<TaskResponseDTO | null> {
    if (!single) {
      const transaction: Transaction = await sequelize.transaction();
      try {
        if (!occurrenceDate) {
          throw new BadRequestError(
            "Occurrence date is required to reassign this and following",
          );
        }

        const task = await PgTask.findByPk(id, { transaction });
        if (!task) throw new NotFoundError(`Task id ${id} not found`);
        if (!task.scheduled_start_time) {
          throw new NotFoundError("Given task has no start date");
        }

        const isSeedDate =
          resetDateToUTCMidnight(task.scheduled_start_time).getTime() ===
          resetDateToUTCMidnight(occurrenceDate).getTime();

        if (
          resetDateToUTCMidnight(occurrenceDate).getTime() <
          resetDateToUTCMidnight(new Date()).getTime()
        ) {
          throw new BadRequestError(
            "Cannot apply 'this and following' to a past occurrence.",
          );
        }

        let resultTask: PgTask;
        if (isSeedDate) {
          const updateResult = await PgTask.update(
            { user_id: user.userId },
            { where: { id }, returning: true, transaction },
          );
          [, [resultTask]] = updateResult;
        } else {
          resultTask = await this.forkRecurrenceWithNewAssignee(
            id,
            occurrenceDate,
            user.userId,
            transaction,
          );
        }

        await transaction.commit();
        return await this.buildTaskResponseDTO(resultTask);
      } catch (error) {
        await transaction.rollback();
        Logger.error(
          `Failed to reassign this and following. Reason = ${getErrorMessage(
            error,
          )}`,
        );
        throw error;
      }
    }

    let resultingTask: PgTask | null;
    let updateResult: [number, PgTask[]] | null;
    try {
      const target = await this.resolveShadowTask(id, occurrenceDate);
      updateResult = await PgTask.update(
        {
          user_id: user.userId,
        },
        { where: { id: target.id }, returning: true },
      );

      if (!updateResult[0]) {
        throw new NotFoundError(`Task id ${target.id} not found`);
      }
      [, [resultingTask]] = updateResult;
    } catch (error: unknown) {
      Logger.error(`Failed to update task. Reason = ${getErrorMessage(error)}`);
      throw error;
    }
    return this.buildTaskResponseDTO(resultingTask);
  }

  async scheduleTask(
    id: string,
    schedule: TaskTimePatchDTO,
  ): Promise<TaskResponseDTO | null> {
    let resultingTask: PgTask | null;
    let updateResult: [number, PgTask[]] | null;
    try {
      const isStartDayNotPast =
        DateTime.fromJSDate(new Date(schedule.time))
          .setZone(TIME_ZONE)
          .startOf("day") >= DateTime.now().setZone(TIME_ZONE).startOf("day");
      updateResult = await PgTask.update(
        {
          scheduled_start_time: schedule.time,
          ...(isStartDayNotPast ? { incomplete_logged_at: null } : {}),
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
      ...requirePetAndTemplateIds(resultingTask),
      scheduledStartTime: resultingTask.scheduled_start_time,
      scheduledEndTime: resultingTask.scheduled_end_time,
      startTime: resultingTask.start_time,
      endTime: resultingTask.end_time,
      notes: resultingTask.notes,
    };
  }

  private async resolveShadowTask(
    taskId: string,
    occurrenceDate?: Date,
  ): Promise<PgTask> {
    const recurrence = await PgRecurrenceTask.findOne({
      where: { task_id: taskId },
    });
    if (!recurrence) {
      const task = await PgTask.findByPk(taskId);
      if (!task) throw new NotFoundError(`Task id ${taskId} not found`);
      return task;
    }

    if (!occurrenceDate) {
      throw new BadRequestError(
        "Occurrence date is required for a recurring task action",
      );
    }

    const normalizedDate = resetDateToUTCMidnight(occurrenceDate);
    const existingShadow = await PgTask.findOne({
      where: { origin_task_id: taskId, occurrence_date: normalizedDate },
    });
    if (existingShadow) return existingShadow;

    const anchor = await PgTask.findByPk(taskId);
    if (!anchor) throw new NotFoundError(`Task id ${taskId} not found`);

    return PgTask.create({
      origin_task_id: Number(taskId),
      occurrence_date: normalizedDate,
      user_id: anchor.user_id,
    });
  }

  async consumeShadowForOccurrence(
    taskId: string,
    date: Date,
    transaction?: Transaction,
  ): Promise<{ userId?: number; startTime?: Date; endTime?: Date } | null> {
    const normalizedDate = resetDateToUTCMidnight(date);
    const shadow = await PgTask.findOne({
      where: { origin_task_id: taskId, occurrence_date: normalizedDate },
      transaction,
    });
    if (!shadow) return null;

    const result = {
      userId: shadow.user_id,
      startTime: shadow.start_time,
      endTime: shadow.end_time,
    };
    await shadow.destroy({ transaction });
    return result;
  }

  /**
   * After a recurrence rule changes (edited in place, or forked into a new
   * series), sorts every existing shadow of the old anchor into one of
   * three outcomes: still covered by the (possibly now-truncated) old rule
   * → left alone; no longer covered by the old rule but covered by the new
   * one → re-pointed to the new anchor; covered by neither → deleted. Pass
   * `newAnchorId`/`newAnchorStart`/`newRecurrence` as null for an in-place
   * edit (same anchor, no fork) — that collapses to a 2-way leave/delete
   * choice, since there's no second series to re-point into.
   */
  async reconcileShadows(
    oldAnchorId: string,
    oldAnchorStart: Date,
    oldRecurrence: {
      days?: Days[] | null;
      cadence: Cadence;
      end_date?: Date | null;
      exclusions?: Date[] | null;
    },
    newAnchorId: string | null,
    newAnchorStart: Date | null,
    newRecurrence: {
      days?: Days[] | null;
      cadence: Cadence;
      end_date?: Date | null;
      exclusions?: Date[] | null;
    } | null,
    transaction: Transaction,
  ): Promise<{ deletedCount: number }> {
    const shadows = await PgTask.findAll({
      where: { origin_task_id: oldAnchorId },
      transaction,
    });

    const outcomes = await Promise.all(
      shadows.map(async (shadow) => {
        if (!shadow.occurrence_date) return false;

        const stillCoveredByOld = matchesRecurrenceRule(
          oldAnchorStart,
          shadow.occurrence_date,
          oldRecurrence,
        );
        if (stillCoveredByOld) return false;

        const coveredByNew =
          newAnchorId && newAnchorStart && newRecurrence
            ? matchesRecurrenceRule(
                newAnchorStart,
                shadow.occurrence_date,
                newRecurrence,
              )
            : false;

        if (coveredByNew && newAnchorId) {
          await PgTask.update(
            { origin_task_id: Number(newAnchorId) },
            { where: { id: shadow.id }, transaction },
          );
          return false;
        }

        await shadow.destroy({ transaction });
        return true;
      }),
    );

    return { deletedCount: outcomes.filter(Boolean).length };
  }

  private async buildTaskResponseDTO(target: PgTask): Promise<TaskResponseDTO> {
    if (!target.origin_task_id) {
      return {
        id: target.id,
        userId: target.user_id,
        ...requirePetAndTemplateIds(target),
        scheduledStartTime: target.scheduled_start_time,
        scheduledEndTime: target.scheduled_end_time,
        startTime: target.start_time,
        endTime: target.end_time,
        notes: target.notes,
      };
    }

    const anchor = await PgTask.findByPk(target.origin_task_id);
    if (!anchor) {
      throw new NotFoundError(
        `Anchor task id ${target.origin_task_id} not found`,
      );
    }

    let occurrenceStartTime = anchor.scheduled_start_time;
    let occurrenceEndTime = anchor.scheduled_end_time;
    if (anchor.scheduled_start_time && target.occurrence_date) {
      const actualStart = new Date(anchor.scheduled_start_time);
      occurrenceStartTime = new Date(
        Date.UTC(
          target.occurrence_date.getUTCFullYear(),
          target.occurrence_date.getUTCMonth(),
          target.occurrence_date.getUTCDate(),
          actualStart.getUTCHours(),
          actualStart.getUTCMinutes(),
          actualStart.getUTCSeconds(),
        ),
      );
      occurrenceEndTime = anchor.scheduled_end_time
        ? new Date(
            occurrenceStartTime.getTime() +
              (new Date(anchor.scheduled_end_time).getTime() -
                actualStart.getTime()),
          )
        : anchor.scheduled_end_time;
    }

    return {
      id: target.id,
      userId: target.user_id,
      ...requirePetAndTemplateIds(anchor),
      scheduledStartTime: occurrenceStartTime,
      scheduledEndTime: occurrenceEndTime,
      startTime: target.start_time,
      endTime: target.end_time,
      notes: anchor.notes,
    };
  }

  async startTask(
    id: string,
    startTime: TaskTimePatchDTO,
    occurrenceDate?: Date,
  ): Promise<TaskResponseDTO | null> {
    let resultingTask: PgTask | null;
    let updateResult: [number, PgTask[]] | null;
    try {
      const target = await this.resolveShadowTask(id, occurrenceDate);
      updateResult = await PgTask.update(
        {
          start_time: startTime.time,
        },
        { where: { id: target.id }, returning: true },
      );

      if (!updateResult[0]) {
        throw new NotFoundError(`Task id ${target.id} not found`);
      }
      [, [resultingTask]] = updateResult;
    } catch (error: unknown) {
      Logger.error(`Failed to update task. Reason = ${getErrorMessage(error)}`);
      throw error;
    }
    return this.buildTaskResponseDTO(resultingTask);
  }

  async endTask(
    id: string,
    endTime: TaskTimePatchDTO,
    occurrenceDate?: Date,
  ): Promise<TaskResponseDTO | null> {
    let resultingTask: PgTask | null;
    let updateResult: [number, PgTask[]] | null;
    try {
      const target = await this.resolveShadowTask(id, occurrenceDate);
      updateResult = await PgTask.update(
        {
          end_time: endTime.time,
        },
        { where: { id: target.id }, returning: true },
      );

      if (!updateResult[0]) {
        throw new NotFoundError(`Task id ${target.id} not found`);
      }
      [, [resultingTask]] = updateResult;
    } catch (error: unknown) {
      Logger.error(`Failed to update task. Reason = ${getErrorMessage(error)}`);
      throw error;
    }
    return this.buildTaskResponseDTO(resultingTask);
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
      ...requirePetAndTemplateIds(resultingTask),
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
          origin_task_id: { [Op.is]: null },
        },
        include: [
          { model: PgRecurrenceTask, required: false },
          { model: TaskTemplate, attributes: ["task_name", "category"] },
          {
            model: User,
            attributes: ["id", "first_name", "last_name", "profile_photo"],
            required: false,
          },
          { model: Pet, attributes: ["name", "photo"], required: false },
        ],
      });

      const reconciledOneTimeTasks = await reconcileLazyTaskStates(
        oneTimeTasks,
      );
      const reconciledUserIdById = new Map(
        reconciledOneTimeTasks.map((task) => [task.id, task.user_id]),
      );

      // A recurrence seed row must respect its recurrence's exclusions
      // ("this task" edits/deletes exclude the date and create a replacement)
      const visibleOneTimeTasks = oneTimeTasks.filter(
        (task) =>
          !task.recurrence?.exclusions?.some(
            (ex: Date) =>
              resetDateToUTCMidnight(new Date(ex)).getTime() ===
              resetDateToUTCMidnight(beginningOfDay).getTime(),
          ),
      );

      const oneTimeTasksWithFlag: TaskResponseDTOForDate[] =
        visibleOneTimeTasks.map((task) => {
          const isStillAssigned = reconciledUserIdById.get(task.id) != null;
          return {
            id: task.id,
            userId: isStillAssigned ? task.user_id : undefined,
            ...requirePetAndTemplateIds(task),
            scheduledStartTime: task.scheduled_start_time,
            scheduledEndTime: task.scheduled_end_time,
            startTime: task.start_time,
            endTime: task.end_time,
            notes: task.notes,
            isRecurring: false,
            taskName: task.task_template?.task_name,
            category: task.task_template?.category,
            petName: task.pet?.name,
            petPhoto: task.pet?.photo,
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
        });

      const recurringWhereClause: Record<string, unknown> = {};
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
                isTaskIncomplete(
                  {
                    end_time: instance.endTime,
                    incomplete_logged_at: undefined,
                    scheduled_start_time: instance.scheduledStartTime,
                  },
                  today,
                ) ||
                isTaskStaleAssignment(
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

              const shadow = await this.resolveShadowTask(
                task.id.toString(),
                selectedDateObj,
              );
              const [reconciled] = await reconcileLazyTaskStates([shadow]);
              return {
                id: task.id,
                userId: reconciled.user_id,
                ...requirePetAndTemplateIds(task),
                scheduledStartTime: instance.scheduledStartTime,
                scheduledEndTime: occurrenceEndTime,
                startTime: reconciled.start_time,
                endTime: reconciled.end_time,
                notes: task.notes,
                isRecurring: true,
              };
            })
            .catch(() => null),
        ),
      );

      const recurringInstances = results.filter(
        (r): r is TaskResponseDTOForDate => r !== null,
      );

      const recurringTaskIds = recurringInstances.map((r) => r.id);
      const enrichedRecurringTasks =
        recurringTaskIds.length > 0
          ? await PgTask.findAll({
              where: { id: recurringTaskIds },
              include: [
                { model: TaskTemplate, attributes: ["task_name", "category"] },
                { model: Pet, attributes: ["name", "photo"], required: false },
              ],
            })
          : [];

      const enrichmentMap = new Map(
        enrichedRecurringTasks.map((t) => [t.id, t]),
      );

      const assignedUserIds = [
        ...new Set(
          recurringInstances
            .map((instance) => instance.userId)
            .filter((id): id is number => id != null),
        ),
      ];
      const assignedUsers =
        assignedUserIds.length > 0
          ? await User.findAll({
              where: { id: assignedUserIds },
              attributes: ["id", "first_name", "last_name", "profile_photo"],
              raw: true,
            })
          : [];
      const assignedUserById = new Map(
        assignedUsers.map((user) => [user.id, user]),
      );

      const enrichedRecurringInstances: TaskResponseDTOForDate[] =
        recurringInstances.map((instance) => {
          const enriched = enrichmentMap.get(instance.id);
          const assignedUserRow =
            instance.userId != null
              ? assignedUserById.get(instance.userId)
              : undefined;
          return {
            ...instance,
            taskName: enriched?.task_template?.task_name,
            category: enriched?.task_template?.category,
            petName: enriched?.pet?.name,
            petPhoto: enriched?.pet?.photo,
            assignedUser: assignedUserRow
              ? {
                  id: assignedUserRow.id,
                  firstName: assignedUserRow.first_name,
                  lastName: assignedUserRow.last_name,
                  profilePhoto: assignedUserRow.profile_photo,
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

      const userFilteredRecurringInstances =
        filters?.userId !== undefined
          ? enrichedRecurringInstances.filter(
              (instance) => instance.userId === filters.userId,
            )
          : enrichedRecurringInstances;

      return [...filteredOneTimeTasks, ...userFilteredRecurringInstances];
    } catch (error: unknown) {
      Logger.error(
        `Failed to get tasks for date. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
  }
}

export default TaskService;
