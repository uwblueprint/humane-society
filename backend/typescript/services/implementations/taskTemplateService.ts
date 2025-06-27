import PgTaskTemplate from "../../models/taskTemplate.model";
import { getErrorMessage, NotFoundError } from "../../utilities/errorUtils";
import logger from "../../utilities/logger";
import {
  ITaskTemplateService,
  TaskTemplateRequestDTO,
  TaskTemplateResponseDTO,
} from "../interfaces/taskTemplateService";

const Logger = logger(__filename);

class TaskTemplateService implements ITaskTemplateService {
  /* eslint-disable class-methods-use-this */
  async getTaskTemplate(id: string): Promise<TaskTemplateResponseDTO> {
    let taskTemplate: PgTaskTemplate | null;
    try {
      taskTemplate = await PgTaskTemplate.findByPk(id, { raw: true });
      if (!taskTemplate) {
        throw new NotFoundError(`TaskTemplate id ${id} not found`);
      }
    } catch (error) {
      Logger.error(
        `Failed to get task type. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }

    return {
      id: taskTemplate.id,
      taskName: taskTemplate.task_name,
    };
  }

  async getTaskTemplates(): Promise<TaskTemplateResponseDTO[]> {
    try {
      const taskTemplates: Array<PgTaskTemplate> = await PgTaskTemplate.findAll(
        {
          raw: true,
        },
      );
      return taskTemplates.map((taskTemplate) => ({
        id: taskTemplate.id,
        taskName: taskTemplate.task_name,
      }));
    } catch (error) {
      Logger.error(
        `Failed to get task types. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  async createTaskTemplate(
    taskTemplate: TaskTemplateRequestDTO,
  ): Promise<TaskTemplateResponseDTO> {
    let newTaskTemplate: PgTaskTemplate | null;
    try {
      newTaskTemplate = await PgTaskTemplate.create({
        task_name: taskTemplate.taskName,
      });
    } catch (error) {
      Logger.error(
        `Failed to create task type. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
    return {
      id: newTaskTemplate.id,
      taskName: newTaskTemplate.task_name,
    };
  }

  async updateTaskTemplate(
    id: string,
    taskTemplate: TaskTemplateRequestDTO,
  ): Promise<TaskTemplateResponseDTO | null> {
    let resultingTaskTemplate: PgTaskTemplate | null;
    let updateResult: [number, PgTaskTemplate[]] | null;
    try {
      updateResult = await PgTaskTemplate.update(
        {
          task_name: taskTemplate.taskName,
        },
        { where: { id }, returning: true },
      );

      if (!updateResult[0]) {
        throw new NotFoundError(`TaskTemplate id ${id} not found`);
      }
      [, [resultingTaskTemplate]] = updateResult;
    } catch (error) {
      Logger.error(
        `Failed to update task type. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
    return {
      id: resultingTaskTemplate.id,
      taskName: resultingTaskTemplate?.task_name,
    };
  }

  async deleteTaskTemplate(id: string): Promise<string> {
    try {
      const deleteResult: number | null = await PgTaskTemplate.destroy({
        where: { id },
      });
      if (!deleteResult) {
        throw new NotFoundError(`TaskTemplate id ${id} not found`);
      }
      return id;
    } catch (error) {
      Logger.error(
        `Failed to delete task type. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
  }
}

export default TaskTemplateService;
