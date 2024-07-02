export interface ActivityRequestDTO {
  activityName: string;
}

export interface ActivityResponseDTO {
  id: number;
  activityName: string;
}

export interface IActivityService {
  /**
   * retrieve the Activity with the given id
   * @param id Activity id
   * @returns requested Activity
   * @throws Error if retrieval fails
   */
  getActivity(id: string): Promise<ActivityResponseDTO>;

  /**
   * retrieve all Activities
   * @param
   * @returns returns array of Activities
   * @throws Error if retrieval fails
   */
  getActivities(): Promise<ActivityResponseDTO[]>;

  /**
   * create a Activity with the fields given in the DTO, return created Activity
   * @param activity new Activity
   * @returns the created Activity
   * @throws Error if creation fails
   */
  createActivity(activity: ActivityRequestDTO): Promise<ActivityResponseDTO>;

  /**
   * update the Activity with the given id with fields in the DTO, return updated Activity
   * @param id Activity id
   * @param activity Updated Activity
   * @returns the updated Activity
   * @throws Error if update fails
   */
  updateActivity(
    id: string,
    activity: ActivityRequestDTO,
  ): Promise<ActivityResponseDTO | null>;

  /**
   * delete the Activity with the given id
   * @param id Activity id
   * @returns id of the Activity deleted
   * @throws Error if deletion fails
   */
  deleteActivity(id: string): Promise<string>;
}
