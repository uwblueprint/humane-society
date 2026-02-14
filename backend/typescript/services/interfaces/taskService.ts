export interface TaskRequestDTO {
  userId?: number;
  petId: number;
  taskTemplateId: number;
  scheduledStartTime?: Date;
  startTime?: Date;
  endTime?: Date;
  notes?: string;
}

export interface TaskResponseDTO {
  id: number;
  userId?: number;
  petId: number;
  taskTemplateId: number;
  scheduledStartTime?: Date;
  startTime?: Date;
  endTime?: Date;
  notes?: string;
}

export interface TaskUserPatchDTO {
  userId: number;
}

export interface TaskTimePatchDTO {
  time: Date;
}

export interface TaskNotesPatchDTO {
  notes: string;
}

export type TaskResponseDTOForDate = TaskResponseDTO & {
  isRecurring: boolean;
};

export interface ITaskService {
  /**
   * retrieve the Task with the given id
   * @param id Task id
   * @returns requested Task
   * @throws Error if retrieval fails
   */
  getTask(id: string): Promise<TaskResponseDTO>;

  /**
   * retrieve all Tasks
   * @param
   * @returns returns array of Tasks
   * @throws Error if retrieval fails
   */
  getTasks(): Promise<Array<TaskResponseDTO>>;

  /**
   * retrieve all Tasks for a specific pet
   * @param pet_id pet id
   * @returns returns array of Tasks
   * @throws Error if retrieval fails
   */
  getPetTasks(pet_id: string): Promise<Array<TaskResponseDTO>>;

  /**
   * retrieve all Tasks for a specific user
   * @param user_id user id
   * @returns returns array of Tasks
   * @throws Error if retrieval fails
   */
  getUserTasks(user_id: string): Promise<Array<TaskResponseDTO>>;

  /**
   * create a Task with the fields given in the DTO, return created Task
   * @param Task new Task to be created
   * @returns the created Task
   * @throws Error if creation fails
   */
  createTask(Task: TaskRequestDTO): Promise<TaskResponseDTO>;

  /**
   * update the Task with the given id with fields in the DTO, return updated Task
   * @param id Task id
   * @param Task Updated Task
   * @returns the updated Task
   * @throws Error if update fails
   */
  updateTask(id: string, Task: TaskRequestDTO): Promise<TaskResponseDTO | null>;

  /**
   * assign a user to an task, or update the user assigned to an task, return updated Task
   * @param id Task id
   * @param user Assigned user
   * @returns the updated Task
   * @throws Error if update fails
   */
  assignUser(
    id: string,
    user: TaskUserPatchDTO,
  ): Promise<TaskResponseDTO | null>;

  /**
   * schedules an task with a start time or updates an existing schedule
   * @param id Task id
   * @param schedule the scheduled start time
   * @returns the updated Task
   * @throws Error if update fails
   */
  scheduleTask(
    id: string,
    schedule: TaskTimePatchDTO,
  ): Promise<TaskResponseDTO | null>;

  /**
   * starts an task by adding a start time
   * @param id Task id
   * @param startTime the scheduled start time
   * @returns the updated Task
   * @throws Error if update fails
   */
  startTask(
    id: string,
    startTime: TaskTimePatchDTO,
  ): Promise<TaskResponseDTO | null>;

  /**
   * ends an task by adding a end time
   * @param id Task id
   * @param endTime the scheduled end time
   * @returns the updated Task
   * @throws Error if update fails
   */
  endTask(
    id: string,
    endTime: TaskTimePatchDTO,
  ): Promise<TaskResponseDTO | null>;

  /**
   * updates notes for an task
   * @param id Task id
   * @param notes the new notes
   * @returns the updated Task
   * @throws Error if update fails
   */
  updateTaskNotes(
    id: string,
    notes: TaskNotesPatchDTO,
  ): Promise<TaskResponseDTO | null>;

  /**
   * delete the Task with the given id
   * @param id Task id
   * @returns id of the Task deleted
   * @throws Error if deletion fails
   */
  deleteTask(id: string): Promise<string>;

  /**
   * retrieve all tasks for a specific date, combining one-time and recurring instances
   * @param date date in YYYY-MM-DD format
   * @param filters optional userId and/or petId filters
   * @returns array of tasks for that date with isRecurring flag
   * @throws Error if retrieval fails
   */
  getTasksForDate(
    date: string,
    filters?: { userId?: number; petId?: number },
  ): Promise<TaskResponseDTOForDate[]>;
}
