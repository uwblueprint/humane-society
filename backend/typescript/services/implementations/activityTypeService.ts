import PgActivityType from "../../models/activityType.model";
import {
  IActivityTypeService,
  ActivityTypeRequestDTO,
  ActivityTypeResponseDTO,
} from "../interfaces/activityTypeService";
import { getErrorMessage, NotFoundError } from "../../utilities/errorUtils";
import logger from "../../utilities/logger";

const Logger = logger(__filename);

class ActivityTypeService implements IActivityTypeService {
  /* eslint-disable class-methods-use-this */
  async getActivityType(id: string): Promise<ActivityTypeResponseDTO> {
    let activityType: PgActivityType | null;
    try {
      activityType = await PgActivityType.findByPk(id, { raw: true });
      if (!activityType) {
        throw new NotFoundError(`ActivityType id ${id} not found`);
      }
    } catch (error: unknown) {
      Logger.error(
        `Failed to get activity type. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }

    return {
      id: activityType.id,
      activityName: activityType.activity_name,
    };
  }

  async getActivityTypes(): Promise<ActivityTypeResponseDTO[]> {
    try {
      const activityTypes: Array<PgActivityType> = await PgActivityType.findAll(
        {
          raw: true,
        },
      );
      return activityTypes.map((activityType) => ({
        id: activityType.id,
        activityName: activityType.activity_name,
      }));
    } catch (error: unknown) {
      Logger.error(
        `Failed to get activity types. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  async createActivityType(
    activityType: ActivityTypeRequestDTO,
  ): Promise<ActivityTypeResponseDTO> {
    let newActivityType: PgActivityType | null;
    try {
      newActivityType = await PgActivityType.create({
        activity_name: activityType.activityName,
      });
    } catch (error: unknown) {
      Logger.error(
        `Failed to create activity type. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
    return {
      id: newActivityType.id,
      activityName: newActivityType.activity_name,
    };
  }

  async updateActivityType(
    id: string,
    activityType: ActivityTypeRequestDTO,
  ): Promise<ActivityTypeResponseDTO | null> {
    let resultingActivityType: PgActivityType | null;
    let updateResult: [number, PgActivityType[]] | null;
    try {
      updateResult = await PgActivityType.update(
        {
          activity_name: activityType.activityName,
        },
        { where: { id }, returning: true },
      );

      if (!updateResult[0]) {
        throw new NotFoundError(`ActivityType id ${id} not found`);
      }
      [, [resultingActivityType]] = updateResult;
    } catch (error: unknown) {
      Logger.error(
        `Failed to update activity type. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
    return {
      id: resultingActivityType.id,
      activityName: resultingActivityType?.activity_name,
    };
  }

  async deleteActivityType(id: string): Promise<string> {
    try {
      const deleteResult: number | null = await PgActivityType.destroy({
        where: { id },
      });
      if (!deleteResult) {
        throw new NotFoundError(`ActivityType id ${id} not found`);
      }
      return id;
    } catch (error: unknown) {
      Logger.error(
        `Failed to delete activity type. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
  }
}

export default ActivityTypeService;
