export interface ActivityRequestDTO {
  userId?: number;
  petId: number;
  activityTypeId: number;
  scheduledStartTime?: Date;
  startTime?: Date;
  endTime?: Date;
  notes?: string;
}

export interface ActivityResponseDTO {
  id: number;
  userId?: number;
  petId: number;
  activityTypeId: number;
  scheduledStartTime?: Date;
  startTime?: Date;
  endTime?: Date;
  notes?: string;
}

export interface ActivityUserPatchDTO {
  userId: number;
}

export interface ActivityTimePatchDTO {
  time: Date;
}

export interface ActivityNotesPatchDTO {
  notes: string;
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
  getActivities(): Promise<Array<ActivityResponseDTO>>;

  /**
   * retrieve all Activities for a specific pet
   * @param pet_id pet id
   * @returns returns array of Activities
   * @throws Error if retrieval fails
   */
  getPetActivities(pet_id: string): Promise<Array<ActivityResponseDTO>>;

   /**
   * retrieve all Activities for a specific user
   * @param user_id user id
   * @returns returns array of Activities
   * @throws Error if retrieval fails
   */
  getUserActivities(user_id: string): Promise<Array<ActivityResponseDTO>>;

  /**
   * create a Activity with the fields given in the DTO, return created Activity
   * @param Activity new Activity to be created
   * @returns the created Activity
   * @throws Error if creation fails
   */
  createActivity(Activity: ActivityRequestDTO): Promise<ActivityResponseDTO>;

  /**
   * update the Activity with the given id with fields in the DTO, return updated Activity
   * @param id Activity id
   * @param Activity Updated Activity
   * @returns the updated Activity
   * @throws Error if update fails
   */
  updateActivity(
    id: string,
    Activity: ActivityRequestDTO,
  ): Promise<ActivityResponseDTO | null>;

  /**
   * assign a user to an activity, or update the user assigned to an activity, return updated Activity
   * @param id Activity id
   * @param user Assigned user
   * @returns the updated Activity
   * @throws Error if update fails
   */
  assignUser(
    id: string,
    user: ActivityUserPatchDTO
  ): Promise<ActivityResponseDTO | null>;

  /**
   * schedules an activity with a start time or updates an existing schedule
   * @param id Activity id
   * @param schedule the scheduled start time
   * @returns the updated Activity
   * @throws Error if update fails
   */
  scheduleActivity(
      id: string,
      schedule: ActivityTimePatchDTO
    ): Promise<ActivityResponseDTO | null>;

  /**
   * starts an activity by adding a start time
   * @param id Activity id
   * @param startTime the scheduled start time
   * @returns the updated Activity
   * @throws Error if update fails
   */
  startActivity(
    id: string,
    startTime: ActivityTimePatchDTO
  ): Promise<ActivityResponseDTO | null>;

  /**
   * ends an activity by adding a end time
   * @param id Activity id
   * @param endTime the scheduled end time
   * @returns the updated Activity
   * @throws Error if update fails
   */
  endActivity(
    id: string,
    endTime: ActivityTimePatchDTO
  ): Promise<ActivityResponseDTO | null>;

  /**
   * updates notes for an activity
   * @param id Activity id
   * @param notes the new notes
   * @returns the updated Activity
   * @throws Error if update fails
   */
  updateActivityNotes(
    id: string,
    notes: ActivityNotesPatchDTO
  ): Promise<ActivityResponseDTO | null>;

  /**
   * delete the Activity with the given id
   * @param id Activity id
   * @returns id of the Activity deleted
   * @throws Error if deletion fails
   */
  deleteActivity(id: string): Promise<string>;
}
