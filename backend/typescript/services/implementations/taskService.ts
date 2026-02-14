import { Op } from "sequelize";
import { DateTime } from "luxon";
import PgTask from "../../models/task.model";
import {
  ITaskService,
  TaskRequestDTO,
  TaskResponseDTO,
  TaskUserPatchDTO,
  TaskTimePatchDTO,
  TaskNotesPatchDTO,
  TaskResponseDTOForDate,
} from "../interfaces/taskService";
import { getErrorMessage, NotFoundError } from "../../utilities/errorUtils";
import logger from "../../utilities/logger";

const Logger = logger(__filename);
const TIME_ZONE = "America/New_York";

class TaskService implements ITaskService {
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
        where: whereClause,
        raw: true,
      });

      const oneTimeTasksWithFlag: TaskResponseDTOForDate[] = oneTimeTasks.map(
        (task) => ({
          id: task.id,
          userId: task.user_id,
          petId: task.pet_id,
          taskTemplateId: task.task_template_id,
          scheduledStartTime: task.scheduled_start_time,
          startTime: task.start_time,
          endTime: task.end_time,
          notes: task.notes,
          isRecurring: false,
        }),
      );

      const recurringInstances: TaskResponseDTOForDate[] = [];

      return [...oneTimeTasksWithFlag, ...recurringInstances];
    } catch (error: unknown) {
      Logger.error(
        `Failed to get tasks for date. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
  }
}

export default TaskService;
