import PgActivity from "../../models/activity.model";
import {
  IActivityService,
  ActivityRequestDTO,
  ActivityResponseDTO,
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
      activityName: activity.activity_name,
    };
  }

  async getActivities(): Promise<ActivityResponseDTO[]> {
    try {
      const activities: Array<PgActivity> = await PgActivity.findAll({
        raw: true,
      });
      return activities.map((activity) => ({
        id: activity.id,
        activityName: activity.activity_name,
      }));
    } catch (error: unknown) {
      Logger.error(
        `Failed to get activities. Reason = ${getErrorMessage(error)}`,
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
        activity_name: activity.activityName,
      });
    } catch (error: unknown) {
      Logger.error(
        `Failed to create activity. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
    return {
      id: newActivity.id,
      activityName: newActivity.activity_name,
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
          activity_name: activity.activityName,
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
      activityName: resultingActivity?.activity_name,
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
