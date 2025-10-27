import baseAPIClient from "./BaseAPIClient";

enum EnumField {
  "A",
  "B",
  "C",
  "D",
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

/** Create a new entity */
const create = async ({
  formData,
}: {
  formData: FormData;
}): Promise<EntityResponse | null> => {
  try {
    const { data } = await baseAPIClient.post("/entities", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (error) {
    return null;
  }
};

/** Get all entities */
const get = async (): Promise<EntityResponse[] | null> => {
  try {
    const { data } = await baseAPIClient.get("/entities");
    return data;
  } catch (error) {
    return null;
  }
};

/** Get a file URL for a specific entity UUID */
const getFile = async (uuid: string): Promise<string | null> => {
  try {
    const { data } = await baseAPIClient.get(`/entities/files/${uuid}`);
    return data.fileURL;
  } catch (error) {
    return null;
  }
};

/** Download entities as CSV */
const getCSV = async (): Promise<string | null> => {
  try {
    const { data } = await baseAPIClient.get("/entities", {
      headers: { "Content-Type": "text/csv" },
    });
    return data;
  } catch (error) {
    return null;
  }
};

/** Update an entity */
const update = async (
  id: number | string,
  {
    entityData,
  }: {
    entityData: FormData;
  },
): Promise<EntityResponse | null> => {
  try {
    const { data } = await baseAPIClient.put(`/entities/${id}`, entityData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (error) {
    return null;
  }
};

/** Delete an entity by UUID */
const deleteEntity = async (
  uuid: number | string,
): Promise<void> => {
  try {
    await baseAPIClient.delete(`/entities/${uuid}`);
  } catch (error) {
    console.error("Failed to delete entity:", error);
  }
};

export default { create, get, getFile, getCSV, update, deleteEntity };
