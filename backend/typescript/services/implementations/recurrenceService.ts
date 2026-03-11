import PgTask from "../../models/task.model";
import RecurrenceTask from "../../models/recurrence_task.model";
import {
  IRecurrenceService,
  CreateRecurringTaskRequestDTO,
  AddRecurrenceRequestDTO,
  RecurringTaskResponseDTO,
} from "../interfaces/recurrenceService";
import {
  getErrorMessage,
  NotFoundError,
  ConflictError,
} from "../../utilities/errorUtils";
import logger from "../../utilities/logger";

const Logger = logger(__filename);

class RecurrenceService implements IRecurrenceService {
  /* eslint-disable class-methods-use-this */
  async createRecurringTask(
    data: CreateRecurringTaskRequestDTO,
  ): Promise<RecurringTaskResponseDTO> {
    let newTask: PgTask | null;
    let newRecurrence: RecurrenceTask | null;

    try {
      newTask = await PgTask.create({
        user_id: data.task.userId,
        pet_id: data.task.petId,
        task_template_id: data.task.taskTemplateId,
        scheduled_start_time: data.task.scheduledStartTime,
        start_time: data.task.startTime,
        end_time: data.task.endTime,
        notes: data.task.notes,
      });

      newRecurrence = await RecurrenceTask.create({
        task_id: newTask.id,
        days: data.recurrence.days,
        cadence: data.recurrence.cadence,
        end_date: data.recurrence.endDate,
        exclusions: data.recurrence.exclusions ?? [],
      });
    } catch (error: unknown) {
      Logger.error(
        `Failed to create recurring task. Reason = ${getErrorMessage(error)}`,
      );
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
      recurrence: {
        taskId: newRecurrence.task_id,
        days: newRecurrence.days,
        cadence: newRecurrence.cadence,
        endDate: newRecurrence.end_date,
        exclusions: newRecurrence.exclusions,
      },
    };
  }

  async addRecurrenceToTask(
    taskId: string,
    data: AddRecurrenceRequestDTO,
  ): Promise<RecurringTaskResponseDTO> {
    let task: PgTask | null;
    let newRecurrence: RecurrenceTask | null;

    try {
      task = await PgTask.findByPk(taskId, {
        include: [{ model: RecurrenceTask, as: "recurrence" }],
      });

      if (!task) {
        throw new NotFoundError(`Task id ${taskId} not found`);
      }

      if (task.recurrence) {
        throw new ConflictError(`Task already has a recurrence rule`);
      }

      if (data.task) {
        await task.update({
          user_id: data.task.userId ?? task.user_id,
          pet_id: data.task.petId ?? task.pet_id,
          task_template_id: data.task.taskTemplateId ?? task.task_template_id,
          scheduled_start_time:
            data.task.scheduledStartTime ?? task.scheduled_start_time,
          start_time: data.task.startTime ?? task.start_time,
          end_time: data.task.endTime ?? task.end_time,
          notes: data.task.notes ?? task.notes,
        });
      }

      newRecurrence = await RecurrenceTask.create({
        task_id: task.id,
        days: data.recurrence.days,
        cadence: data.recurrence.cadence,
        end_date: data.recurrence.endDate,
        exclusions: data.recurrence.exclusions ?? [],
      });
    } catch (error: unknown) {
      Logger.error(
        `Failed to add recurrence to task. Reason = ${getErrorMessage(error)}`,
      );
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
      recurrence: {
        taskId: newRecurrence.task_id,
        days: newRecurrence.days,
        cadence: newRecurrence.cadence,
        endDate: newRecurrence.end_date,
        exclusions: newRecurrence.exclusions,
      },
    };
  }
}

export default RecurrenceService;
