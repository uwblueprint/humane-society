export interface TaskTemplateRequestDTO {
  taskName: string;
}

export interface TaskTemplateResponseDTO {
  id: number;
  taskName: string;
}

export interface ITaskTemplateService {
  /**
   * Retrieve the TaskTemplate with the given id.
   * @param id TaskTemplate id
   * @returns Requested TaskTemplate
   * @throws Error if retrieval fails
   */
  getTaskTemplate(id: string): Promise<TaskTemplateResponseDTO>;

  /**
   * Retrieve all Task Types.
   * @returns Returns an array of TaskTemplates
   * @throws Error if retrieval fails
   */
  getTaskTemplates(page: number, limit: number): Promise<TaskTemplateResponseDTO[]>;

  /**
   * Create an TaskTemplate with the fields given in the DTO, return created TaskTemplate
   * @param task New TaskTemplate
   * @returns The created TaskTemplate
   * @throws Error if creation fails
   */
  createTaskTemplate(
    task: TaskTemplateRequestDTO,
  ): Promise<TaskTemplateResponseDTO>;

  /**
   * Update the TaskTemplate with the given id with fields in the DTO, return updated TaskTemplate
   * @param id TaskTemplate id
   * @param task Updated TaskTemplate
   * @returns The updated TaskTemplate
   * @throws Error if update fails
   */
  updateTaskTemplate(
    id: string,
    task: TaskTemplateRequestDTO,
  ): Promise<TaskTemplateResponseDTO | null>;

  /**
   * Delete the TaskTemplate with the given id
   * @param id TaskTemplate id
   * @returns id of the TaskTemplate deleted
   * @throws Error if deletion fails
   */
  deleteTaskTemplate(id: string): Promise<string>;
}
