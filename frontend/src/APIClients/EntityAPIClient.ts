import baseAPIClient from "./BaseAPIClient";

export enum EnumField {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
}

export type EntityRequest = {
  stringField: string;
  intField: number;
  stringArrayField: string[];
  enumField: EnumField;
  boolField: boolean;
};

export type EntityResponse = {
  id: string | number;
  stringField: string;
  intField: number;
  stringArrayField: string[];
  enumField: EnumField;
  boolField: boolean;
  fileName: string;
};

/** Create a new entity (supports FormData for file uploads) */
export const create = async (formData: FormData): Promise<EntityResponse> => {
  const { data } = await baseAPIClient.post("/entities", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

/** Fetch all entities */
export const get = async (): Promise<EntityResponse[]> => {
  const { data } = await baseAPIClient.get("/entities");
  return data;
};

/** Get file URL for a given entity UUID */
export const getFile = async (uuid: string): Promise<string> => {
  const { data } = await baseAPIClient.get(`/entities/files/${uuid}`);
  return data.fileURL;
};

/** Download entities as CSV */
export const getCSV = async (): Promise<string> => {
  const { data } = await baseAPIClient.get("/entities", {
    headers: { "Content-Type": "text/csv" },
  });
  return data;
};

/** Update an entity */
export const update = async (
  id: number | string,
  entityData: FormData,
): Promise<EntityResponse> => {
  const { data } = await baseAPIClient.put(`/entities/${id}`, entityData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

/** Delete an entity by UUID */
export const deleteEntity = async (
  uuid: number | string,
): Promise<void> => {
  await baseAPIClient.delete(`/entities/${uuid}`);
};

export default { create, get, getFile, getCSV, update, deleteEntity };
