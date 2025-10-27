import baseAPIClient from "./BaseAPIClient";

enum EnumField {
  "A",
  "B",
  "C",
  "D",
}

export type SimpleEntityRequest = {
  stringField: string;
  intField: number;
  stringArrayField: string[];
  enumField: EnumField;
  boolField: boolean;
};

export type SimpleEntityResponse = {
  id: string | number;
  stringField: string;
  intField: number;
  stringArrayField: string[];
  enumField: EnumField;
  boolField: boolean;
};

/** Create a new simple entity */
const create = async ({
  formData,
}: {
  formData: SimpleEntityRequest;
}): Promise<SimpleEntityResponse | null> => {
  try {
    const { data } = await baseAPIClient.post("/simple-entities", formData);
    return data;
  } catch (error) {
    console.error("Failed to create simple entity:", error);
    return null;
  }
};

/** Get all simple entities */
const get = async (): Promise<SimpleEntityResponse[] | null> => {
  try {
    const { data } = await baseAPIClient.get("/simple-entities");
    return data;
  } catch (error) {
    console.error("Failed to fetch simple entities:", error);
    return null;
  }
};

/** Get simple entities as CSV */
const getCSV = async (): Promise<string> => {
  try {
    const { data } = await baseAPIClient.get("/simple-entities", {
      headers: { "Content-Type": "text/csv" },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch simple entities CSV:", error);
    return "";
  }
};

/** Update a simple entity */
const update = async (
  id: number | string,
  {
    entityData,
  }: {
    entityData: SimpleEntityRequest;
  },
): Promise<SimpleEntityResponse | null> => {
  try {
    const { data } = await baseAPIClient.put(
      `/simple-entities/${id}`,
      entityData,
    );
    return data;
  } catch (error) {
    console.error("Failed to update simple entity:", error);
    return null;
  }
};

export default { create, get, getCSV, update };
