import PgActivity from "../../models/activity.model";
import {
  IActivityService,
  ActivityRequestDTO,
  ActivityResponseDTO,
  ActivityUserPatchDTO,
  ActivityTimePatchDTO,
  ActivityNotesPatchDTO,
} from "../interfaces/activityService";
import { getErrorMessage, NotFoundError } from "../../utilities/errorUtils";
import logger from "../../utilities/logger";

const Logger = logger(__filename);

class ActivityService implements IActivityService {
  /* eslint-disable class-methods-use-this */
  async getActivity(id: string): Promise<ActivityResponseDTO> {
    let activity: PgActivity | null;
    try {
      activity = await PgActivity.findByPk(id, { raw: true });
      if (!activity) {
        throw new NotFoundError(`Activity id ${id} not found`);
      }
    } catch (error: unknown) {
      Logger.error(
        `Failed to get activity. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }

    return {
      id: activity.id,
      userId: activity.user_id,
      petId: activity.pet_id,
      activityTypeId: activity.activity_type_id,
      scheduledStartTime: activity.scheduled_start_time,
      startTime: activity.start_time,
      endTime: activity.end_time,
      notes: activity.notes,
    };
  }

  async getActivities(): Promise<ActivityResponseDTO[]> {
    try {
      const activities: Array<PgActivity> = await PgActivity.findAll({
        raw: true,
      });
      return activities.map((activity) => ({
        id: activity.id,
        userId: activity.user_id,
        petId: activity.pet_id,
        activityTypeId: activity.activity_type_id,
        scheduledStartTime: activity.scheduled_start_time,
        startTime: activity.start_time,
        endTime: activity.end_time,
        notes: activity.notes,
      }));
    } catch (error: unknown) {
      Logger.error(
        `Failed to get activites. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  async getPetActivities(pet_id: string): Promise<Array<ActivityResponseDTO>> {
    try {
      const activities: Array<PgActivity> = await PgActivity.findAll({
        where: {
          pet_id,
        },
        raw: true,
      });
      if (!activities[0]) {
        throw new NotFoundError(`No activities for pet id ${pet_id}`);
      }
      return activities.map((activity) => ({
        id: activity.id,
        userId: activity.user_id,
        petId: activity.pet_id,
        activityTypeId: activity.activity_type_id,
        scheduledStartTime: activity.scheduled_start_time,
        startTime: activity.start_time,
        endTime: activity.end_time,
        notes: activity.notes,
      }));
    } catch (error: unknown) {
      Logger.error(
        `Failed to get activites. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  async getUserActivities(
    user_id: string,
  ): Promise<Array<ActivityResponseDTO>> {
    try {
      const activities: Array<PgActivity> = await PgActivity.findAll({
        where: {
          user_id,
        },
        raw: true,
      });
      if (!activities[0]) {
        throw new NotFoundError(`No activities for user id ${user_id}`);
      }
      return activities.map((activity) => ({
        id: activity.id,
        userId: activity.user_id,
        petId: activity.pet_id,
        activityTypeId: activity.activity_type_id,
        scheduledStartTime: activity.scheduled_start_time,
        startTime: activity.start_time,
        endTime: activity.end_time,
        notes: activity.notes,
      }));
    } catch (error: unknown) {
      Logger.error(
        `Failed to get activites. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  async createActivity(
    activity: ActivityRequestDTO,
  ): Promise<ActivityResponseDTO> {
    let newActivity: PgActivity | null;
    try {
      newActivity = await PgActivity.create({
        user_id: activity.userId,
        pet_id: activity.petId,
        activity_type_id: activity.activityTypeId,
        scheduled_start_time: activity.scheduledStartTime,
        start_time: activity.startTime,
        end_time: activity.endTime,
        notes: activity.notes,
      });
    } catch (error: unknown) {
      Logger.error(
        `Failed to create activity. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
    return {
      id: newActivity.id,
      userId: newActivity.user_id,
      petId: newActivity.pet_id,
      activityTypeId: newActivity.activity_type_id,
      scheduledStartTime: newActivity.scheduled_start_time,
      startTime: newActivity.start_time,
      endTime: newActivity.end_time,
      notes: newActivity.notes,
    };
  }

  async updateActivity(
    id: string,
    activity: ActivityRequestDTO,
  ): Promise<ActivityResponseDTO | null> {
    let resultingActivity: PgActivity | null;
    let updateResult: [number, PgActivity[]] | null;
    try {
      updateResult = await PgActivity.update(
        {
          user_id: activity.userId,
          pet_id: activity.petId,
          activity_type_id: activity.activityTypeId,
          scheduled_start_time: activity.scheduledStartTime,
          start_time: activity.startTime,
          end_time: activity.endTime,
          notes: activity.notes,
        },
        { where: { id }, returning: true },
      );

      if (!updateResult[0]) {
        throw new NotFoundError(`Activity id ${id} not found`);
      }
      [, [resultingActivity]] = updateResult;
    } catch (error: unknown) {
      Logger.error(
        `Failed to update activity. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
    return {
      id: resultingActivity.id,
      userId: resultingActivity.user_id,
      petId: resultingActivity.pet_id,
      activityTypeId: resultingActivity.activity_type_id,
      scheduledStartTime: resultingActivity.scheduled_start_time,
      startTime: resultingActivity.start_time,
      endTime: resultingActivity.end_time,
      notes: resultingActivity.notes,
    };
  }

  async assignUser(
    id: string,
    user: ActivityUserPatchDTO,
  ): Promise<ActivityResponseDTO | null> {
    let resultingActivity: PgActivity | null;
    let updateResult: [number, PgActivity[]] | null;
    try {
      updateResult = await PgActivity.update(
        {
          user_id: user.userId,
        },
        { where: { id }, returning: true },
      );

      if (!updateResult[0]) {
        throw new NotFoundError(`Activity id ${id} not found`);
      }
      [, [resultingActivity]] = updateResult;
    } catch (error: unknown) {
      Logger.error(
        `Failed to update activity. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
    return {
      id: resultingActivity.id,
      userId: resultingActivity.user_id,
      petId: resultingActivity.pet_id,
      activityTypeId: resultingActivity.activity_type_id,
      scheduledStartTime: resultingActivity.scheduled_start_time,
      startTime: resultingActivity.start_time,
      endTime: resultingActivity.end_time,
      notes: resultingActivity.notes,
    };
  }

  async scheduleActivity(
    id: string,
    schedule: ActivityTimePatchDTO,
  ): Promise<ActivityResponseDTO | null> {
    let resultingActivity: PgActivity | null;
    let updateResult: [number, PgActivity[]] | null;
    try {
      updateResult = await PgActivity.update(
        {
          scheduled_start_time: schedule.time,
        },
        { where: { id }, returning: true },
      );

      if (!updateResult[0]) {
        throw new NotFoundError(`Activity id ${id} not found`);
      }
      [, [resultingActivity]] = updateResult;
    } catch (error: unknown) {
      Logger.error(
        `Failed to update activity. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
    return {
      id: resultingActivity.id,
      userId: resultingActivity.user_id,
      petId: resultingActivity.pet_id,
      activityTypeId: resultingActivity.activity_type_id,
      scheduledStartTime: resultingActivity.scheduled_start_time,
      startTime: resultingActivity.start_time,
      endTime: resultingActivity.end_time,
      notes: resultingActivity.notes,
    };
  }

  async startActivity(
    id: string,
    startTime: ActivityTimePatchDTO,
  ): Promise<ActivityResponseDTO | null> {
    let resultingActivity: PgActivity | null;
    let updateResult: [number, PgActivity[]] | null;
    try {
      updateResult = await PgActivity.update(
        {
          start_time: startTime.time,
        },
        { where: { id }, returning: true },
      );

      if (!updateResult[0]) {
        throw new NotFoundError(`Activity id ${id} not found`);
      }
      [, [resultingActivity]] = updateResult;
    } catch (error: unknown) {
      Logger.error(
        `Failed to update activity. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
    return {
      id: resultingActivity.id,
      userId: resultingActivity.user_id,
      petId: resultingActivity.pet_id,
      activityTypeId: resultingActivity.activity_type_id,
      scheduledStartTime: resultingActivity.scheduled_start_time,
      startTime: resultingActivity.start_time,
      endTime: resultingActivity.end_time,
      notes: resultingActivity.notes,
    };
  }

  async endActivity(
    id: string,
    endTime: ActivityTimePatchDTO,
  ): Promise<ActivityResponseDTO | null> {
    let resultingActivity: PgActivity | null;
    let updateResult: [number, PgActivity[]] | null;
    try {
      updateResult = await PgActivity.update(
        {
          end_time: endTime.time,
        },
        { where: { id }, returning: true },
      );

      if (!updateResult[0]) {
        throw new NotFoundError(`Activity id ${id} not found`);
      }
      [, [resultingActivity]] = updateResult;
    } catch (error: unknown) {
      Logger.error(
        `Failed to update activity. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
    return {
      id: resultingActivity.id,
      userId: resultingActivity.user_id,
      petId: resultingActivity.pet_id,
      activityTypeId: resultingActivity.activity_type_id,
      scheduledStartTime: resultingActivity.scheduled_start_time,
      startTime: resultingActivity.start_time,
      endTime: resultingActivity.end_time,
      notes: resultingActivity.notes,
    };
  }

  async updateActivityNotes(
    id: string,
    notes: ActivityNotesPatchDTO,
  ): Promise<ActivityResponseDTO | null> {
    let resultingActivity: PgActivity | null;
    let updateResult: [number, PgActivity[]] | null;
    try {
      updateResult = await PgActivity.update(
        {
          notes: notes.notes,
        },
        { where: { id }, returning: true },
      );

      if (!updateResult[0]) {
        throw new NotFoundError(`Activity id ${id} not found`);
      }
      [, [resultingActivity]] = updateResult;
    } catch (error: unknown) {
      Logger.error(
        `Failed to update activity. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
    return {
      id: resultingActivity.id,
      userId: resultingActivity.user_id,
      petId: resultingActivity.pet_id,
      activityTypeId: resultingActivity.activity_type_id,
      scheduledStartTime: resultingActivity.scheduled_start_time,
      startTime: resultingActivity.start_time,
      endTime: resultingActivity.end_time,
      notes: resultingActivity.notes,
    };
  }

  async deleteActivity(id: string): Promise<string> {
    try {
      const deleteResult: number | null = await PgActivity.destroy({
        where: { id },
      });
      if (!deleteResult) {
        throw new NotFoundError(`Activity id ${id} not found`);
      }
      return id;
    } catch (error: unknown) {
      Logger.error(
        `Failed to delete activity. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
  }
}

export default ActivityService;
