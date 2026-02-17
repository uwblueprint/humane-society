import PgTask from "../../models/task.model";
import PgRecurrenceTask from "../../models/recurrence_task.model";
import {
  ITaskService,
  TaskRequestDTO,
  TaskResponseDTO,
  TaskUserPatchDTO,
  TaskTimePatchDTO,
  TaskNotesPatchDTO,
} from "../interfaces/taskService";
import { getErrorMessage, NotFoundError } from "../../utilities/errorUtils";
import logger from "../../utilities/logger";
import { isDateInRecurrence } from "../../utilities/dateUtils";
import { fn, col } from "sequelize";
const Logger = logger(__filename);

class TaskService implements ITaskService {

  async createRecurrence(taskId: string, days: number[], cadence: string, endDate: Date) {
    try {
      const recurrenceTask = await PgRecurrenceTask.create({
        task_id: taskId,
        days: days,
        cadence: cadence,
        end_date: endDate,
      })

      return {
        recurrenceId: recurrenceTask.id,
        taskId: recurrenceTask.task_id,
        days: recurrenceTask.days,
        cadence: recurrenceTask.cadence,
        endDate: recurrenceTask.end_date,
      }
    } catch (error: unknown) {
      Logger.error(`Failed to create recurrence. Reason = ${getErrorMessage(error)}`);
      throw error;
    }
  }

  async getRecurrence(taskId: string) {
    try {
      const recurrenceTask = await PgRecurrenceTask.findByPk(taskId, { raw: true });
      if (!recurrenceTask) {
        throw new NotFoundError(`Task id ${taskId} not found`);
      }
    } catch (error: unknown) {
      Logger.error(`Failed to get recurrence. Reason = ${getErrorMessage(error)}`);
      throw error;
    }
  }

  async updateRecurrence(recurrenceId: string, updates: Partial<PgRecurrenceTask>) {
    try {
      const updatedRecurrenceTask = await PgRecurrenceTask.update({
        ...updates,
      }, { where: { id: recurrenceId }, returning: true });

      if (0 === updatedRecurrenceTask[0]) {
        throw new NotFoundError(`Recurrence id ${recurrenceId} not found`);
      }

      return {
        recurrenceId: updatedRecurrenceTask[1][0].id,
        taskId: updatedRecurrenceTask[1][0].task_id,
        days: updatedRecurrenceTask[1][0].days,
        cadence:  updatedRecurrenceTask[1][0].cadence,
        endDate: updatedRecurrenceTask[1][0].end_date,
      }
    } catch (error: unknown) {
      Logger.error(`Failed to update recurrence. Reason = ${getErrorMessage(error)}`);
      throw error;
    }
  }

  async deleteRecurrence(recurrenceId: string) {
    try {
      const result = await PgRecurrenceTask.destroy({
        where: { id: recurrenceId },
      });
      if (0 === result) {
        throw new NotFoundError(`Recurrence id ${recurrenceId} not found`);
      }

      return recurrenceId
    } catch (error: unknown) {
      Logger.error(`Failed to delete recurrence. Reason = ${getErrorMessage(error)}`);
      throw error;
    }
  }

  async excludeDate(recurrenceId: string, date: Date) {
    try {
     // todo: check if this date is valid, ie if a taks was suppsoed to occur at this date
     await PgRecurrenceTask.update(
        {
          exclusions: fn(
            "array_append",
            fn("coalesce", col("exclusions"), []),
            date
          )
        },
        {
          where: { id: recurrenceId }
        }
      );
    } catch (error: unknown) {
      Logger.error(`Failed to exclude date from recurrence. Reason = ${getErrorMessage(error)}`);
      throw error;
    }
  }

  async generateRecurringInstanceForData(taskId: string, date: Date) {
    try {
      const task = await PgTask.findByPk(taskId, { raw: true });
      const recurrence = await PgRecurrenceTask.findOne({ where: { task_id: taskId }, raw: true });
      if (!task || !recurrence) {
        throw new NotFoundError(`Task or recurrence not found`);
      }

      if (!task.scheduled_start_time) {
        return null;
      }

      const dayNameToIndex = {
        "Sun": 0, "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6
      };

      // Note: We assume that recurrence.days will contain the day of week of the start date
      const originalStart = new Date(task.scheduled_start_time);
      const targetDayIndex = date.getUTCDay(); // 0 (Sun) - 6 (Sat)
      const recurrenceDayIndices = recurrence.days.map((d: string) => dayNameToIndex[d]);
      const isDayMatch = recurrenceDayIndices.includes(targetDayIndex);

  
      if (date < originalStart) return null;
      if (recurrence.end_date && date > new Date(recurrence.end_date)) return null;
      if (recurrence.exclusions?.some((ex: Date) => ex.getTime() === date.getTime())) return null;
  

      for (const day of recurrence.days) {
        if (originalStart.getUTCDay() === dayNameToIndex[day]) continue;
        const diff = (dayNameToIndex[day] - originalStart.getUTCDay() + 7) % 7;
        const startDate = new Date(originalStart);
        startDate.setUTCDate(originalStart.getUTCDate() + diff);
        if (isDateInRecurrence(startDate, date, recurrence.cadence)) {
          return {
            id: task.id,
            userId: task.user_id,
            petId: task.pet_id,
            taskTemplateId: task.task_template_id,
            scheduledStartTime: task.scheduled_start_time,
            startTime: task.start_time,
            endTime: task.end_time,
            notes: task.notes,
          };
        }
      }
      return null;
    } catch (error) {
      Logger.error(`Failed to generate recurring instance. Reason = ${getErrorMessage(error)}`);
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
      startTime: task.start_time,
      endTime: task.end_time,
      notes: task.notes,
    };
  }

  async getTasks(): Promise<TaskResponseDTO[]> {
    try {
      const tasks: Array<PgTask> = await PgTask.findAll({
        raw: true,
      });
      return tasks.map((task) => ({
        id: task.id,
        userId: task.user_id,
        petId: task.pet_id,
        taskTemplateId: task.task_template_id,
        scheduledStartTime: task.scheduled_start_time,
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
      const tasks: Array<PgTask> = await PgTask.findAll({
        where: {
          pet_id,
        },
        raw: true,
      });
      if (!tasks[0]) {
        throw new NotFoundError(`No tasks for pet id ${pet_id}`);
      }
      return tasks.map((task) => ({
        id: task.id,
        userId: task.user_id,
        petId: task.pet_id,
        taskTemplateId: task.task_template_id,
        scheduledStartTime: task.scheduled_start_time,
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
      const tasks: Array<PgTask> = await PgTask.findAll({
        where: {
          user_id,
        },
        raw: true,
      });
      if (!tasks[0]) {
        throw new NotFoundError(`No tasks for user id ${user_id}`);
      }
      return tasks.map((task) => ({
        id: task.id,
        userId: task.user_id,
        petId: task.pet_id,
        taskTemplateId: task.task_template_id,
        scheduledStartTime: task.scheduled_start_time,
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

  async createTask(task: TaskRequestDTO): Promise<TaskResponseDTO> {
    let newTask: PgTask | null;
    try {
      newTask = await PgTask.create({
        user_id: task.userId,
        pet_id: task.petId,
        task_template_id: task.taskTemplateId,
        scheduled_start_time: task.scheduledStartTime,
        start_time: task.startTime,
        end_time: task.endTime,
        notes: task.notes,
      });
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
      updateResult = await PgTask.update(
        {
          user_id: task.userId,
          pet_id: task.petId,
          task_template_id: task.taskTemplateId,
          scheduled_start_time: task.scheduledStartTime,
          start_time: task.startTime,
          end_time: task.endTime,
          notes: task.notes,
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
      updateResult = await PgTask.update(
        {
          scheduled_start_time: schedule.time,
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
}

export default TaskService;
