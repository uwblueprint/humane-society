import AUTHENTICATED_USER_KEY from "../constants/AuthConstants";
import {
  CreateTaskDTO,
  EditTaskDTO,
  Task,
  TaskTemplateResponseDTO,
} from "../types/TaskTypes";
import { getLocalStorageObjProperty } from "../utils/LocalStorageUtils";
import baseAPIClient from "./BaseAPIClient";
import { InteractionType } from "../types/InteractionTypes";

function transformTaskTemplateResponse(dto: TaskTemplateResponseDTO): Task {
  return {
    id: dto.id,
    name: dto.taskName,
    category: dto.category,
    instructions: dto.instructions ?? "",
  };
}

const getTaskTemplate = async (taskTemplateId: number): Promise<Task> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    const { data } = await baseAPIClient.get(
      `/task-templates/${taskTemplateId}`,
      {
        headers: { Authorization: bearerToken },
      },
    );
    return transformTaskTemplateResponse(data);
  } catch (error) {
    throw new Error(`Failed to fetch task template: ${error}`);
  }
};

const getAllTaskTemplates = async (): Promise<Task[]> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    const { data } = await baseAPIClient.get("/task-templates", {
      headers: { Authorization: bearerToken },
    });
    return data.map(transformTaskTemplateResponse);
  } catch (error) {
    throw new Error(`Failed to fetch task templates: ${error}`);
  }
};

const createTaskTemplate = async (formData: CreateTaskDTO): Promise<Task> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    const { data } = await baseAPIClient.post("/task-templates", formData, {
      headers: { Authorization: bearerToken },
    });
    return transformTaskTemplateResponse(data);
  } catch (error) {
    throw new Error(`Failed to create task template: ${error}`);
  }
};

const editTaskTemplate = async (
  taskTemplateId: number | string,
  formData: EditTaskDTO,
): Promise<Task> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    const { data } = await baseAPIClient.put(
      `/task-templates/${taskTemplateId}`,
      formData,
      {
        headers: { Authorization: bearerToken },
      },
    );
    return transformTaskTemplateResponse(data);
  } catch (error) {
    throw new Error(`Failed to edit task template: ${error}`);
  }
};

const updateName = async (
  taskTemplateId: number | string,
  body: {
    name: string;
    actorId: number;
    targetId: number;
    oldTaskTemplateName: string;
    newTaskTemplateName: string;
  },
): Promise<Task> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    const { data } = await baseAPIClient.patch(
      `/task-templates/${taskTemplateId}/name`,
      { ...body, interactionType: InteractionType.CHANGED_TASK_TEMPLATE_NAME },
      { headers: { Authorization: bearerToken } },
    );
    return transformTaskTemplateResponse(data);
  } catch (error) {
    throw new Error(`Failed to update task template name: ${error}`);
  }
};

const updateInstructions = async (
  taskTemplateId: number | string,
  body: {
    instructions: string;
    actorId: number;
    targetId: number;
    taskTemplateName: string;
    oldInstructions: string;
    newInstructions: string;
  },
): Promise<Task> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    const { data } = await baseAPIClient.patch(
      `/task-templates/${taskTemplateId}/instructions`,
      {
        ...body,
        interactionType: InteractionType.CHANGED_TASK_TEMPLATE_INSTRUCTIONS,
      },
      { headers: { Authorization: bearerToken } },
    );
    return transformTaskTemplateResponse(data);
  } catch (error) {
    throw new Error(`Failed to update task template instructions: ${error}`);
  }
};

const deleteTaskTemplate = async (
  taskTemplateId: number | string,
  body?: {
    actorId: number;
    targetId: number;
    taskTemplateName: string;
  },
): Promise<{ taskTemplateId: number }> => {
  const bearerToken = `Bearer ${getLocalStorageObjProperty(
    AUTHENTICATED_USER_KEY,
    "accessToken",
  )}`;
  try {
    const { data } = await baseAPIClient.delete(
      `/task-templates/${taskTemplateId}`,
      {
        headers: { Authorization: bearerToken },
        data: {
          ...body,
          interactionType: InteractionType.DELETED_TASK_TEMPLATE,
        },
      },
    );
    return data;
  } catch (error) {
    throw new Error(`Failed to delete task template: ${error}`);
  }
};

export default {
  getTaskTemplate,
  getAllTaskTemplates,
  createTaskTemplate,
  editTaskTemplate,
  updateName,
  updateInstructions,
  deleteTaskTemplate,
};
