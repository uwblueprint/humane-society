import { Cadence, Days } from "../../types";
import { TaskRequestDTO } from "./taskService";

export interface RecurrenceRequestDTO {
  days?: Days[];
  cadence: Cadence;
  endDate?: Date | null;
  exclusions?: Date[];
}

export interface CreateRecurringTaskRequestDTO {
  task: TaskRequestDTO;
  recurrence: RecurrenceRequestDTO;
}

export interface AddRecurrenceRequestDTO {
  task?: Partial<TaskRequestDTO>;
  recurrence: RecurrenceRequestDTO;
}

export interface RecurrenceResponseDTO {
  taskId: number;
  days?: Days[];
  cadence: Cadence;
  endDate?: Date | null;
  exclusions?: Date[];
}

export interface RecurringTaskResponseDTO {
  id: number;
  userId?: number;
  petId: number;
  taskTemplateId: number;
  scheduledStartTime?: Date;
  startTime?: Date;
  endTime?: Date;
  notes?: string;
  recurrence?: RecurrenceResponseDTO;
}

export interface IRecurrenceService {
  /**
   * create a new task with a recurrence rule
   * @param data task and recurrence data
   * @returns the created task with recurrence
   * @throws Error if creation fails
   */
  createRecurringTask(
    data: CreateRecurringTaskRequestDTO,
  ): Promise<RecurringTaskResponseDTO>;

  /**
   * add a recurrence rule to an existing task
   * @param taskId the task id to add recurrence to
   * @param data optional task updates and recurrence data
   * @returns the updated task with recurrence
   * @throws NotFoundError if task does not exist
   * @throws ConflictError if task already has a recurrence rule
   */
  addRecurrenceToTask(
    taskId: string,
    data: AddRecurrenceRequestDTO,
  ): Promise<RecurringTaskResponseDTO>;
}
