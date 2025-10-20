import baseAPIClient from "./BaseAPIClient";

export enum EnumField {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
}

export type SimpleEntityRequest = {
  stringField: string;
  intField: number;
  stringArrayField: string[];
  enumField: EnumField;
  boolField: boolean;
};

export type SimpleEntityResponse = SimpleEntityRequest & {
  id: string | number;
};

const create = async (formData: SimpleEntityRequest): Promise<SimpleEntityResponse> => {
  const { data } = await baseAPIClient.post("/simple-entities", formData);
  return data;
};

const getAll = async (): Promise<SimpleEntityResponse[]> => {
  const { data } = await baseAPIClient.get("/simple-entities");
  return data;
};

const getCSV = async (): Promise<string> => {
  const { data } = await baseAPIClient.get("/simple-entities", {
    headers: { "Content-Type": "text/csv" },
  });
  return data;
};

const update = async (
  id: string | number,
  entityData: SimpleEntityRequest
): Promise<SimpleEntityResponse> => {
  const { data } = await baseAPIClient.put(`/simple-entities/${id}`, entityData);
  return data;
};

export default { create, getAll, getCSV, update };
