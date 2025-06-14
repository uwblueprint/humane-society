export interface ActivityTypeRequestDTO {
  activityName: string;
}

export interface ActivityTypeResponseDTO {
  id: number;
  activityName: string;
}

export interface IActivityTypeService {
  /**
   * Retrieve the ActivityType with the given id.
   * @param id ActivityType id
   * @returns Requested ActivityType
   * @throws Error if retrieval fails
   */
  getActivityType(id: string): Promise<ActivityTypeResponseDTO>;

  /**
   * Retrieve all Activity Types.
   * @returns Returns an array of ActivityTypes
   * @throws Error if retrieval fails
   */
  getActivityTypes(
    page: number,
    limit: number,
  ): Promise<ActivityTypeResponseDTO[]>;

  /**
   * Create an ActivityType with the fields given in the DTO, return created ActivityType
   * @param activity New ActivityType
   * @returns The created ActivityType
   * @throws Error if creation fails
   */
  createActivityType(
    activity: ActivityTypeRequestDTO,
  ): Promise<ActivityTypeResponseDTO>;

  /**
   * Update the ActivityType with the given id with fields in the DTO, return updated ActivityType
   * @param id ActivityType id
   * @param activity Updated ActivityType
   * @returns The updated ActivityType
   * @throws Error if update fails
   */
  updateActivityType(
    id: string,
    activity: ActivityTypeRequestDTO,
  ): Promise<ActivityTypeResponseDTO | null>;

  /**
   * Delete the ActivityType with the given id
   * @param id ActivityType id
   * @returns id of the ActivityType deleted
   * @throws Error if deletion fails
   */
  deleteActivityType(id: string): Promise<string>;
}
