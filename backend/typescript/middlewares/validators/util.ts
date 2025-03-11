type Type =
  | "string"
  | "integer"
  | "boolean"
  | "decimal"
  | "PetStatus"
  | "Sex"
  | "AnimalTagEnum"
  | "Date";

const allowableContentTypes = new Set([
  "text/plain",
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/gif",
]);

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const validatePrimitive = (value: any, type: Type): boolean => {
  if (value === undefined || value === null) return false;

  switch (type) {
    case "string": {
      return typeof value === "string";
    }
    case "boolean": {
      return typeof value === "boolean";
    }
    case "integer": {
      return typeof value === "number" && Number.isInteger(value);
    }
    case "decimal": {
      return typeof value === "number" && !Number.isNaN(value);
    }
    default: {
      return false;
    }
  }
};

export const validateEnum = (value: any, enumType: any): boolean => {
  return Object.values(enumType).includes(value);
};

export const validateArray = (value: any, type: Type, isEnum = false): boolean => {
  return (
    value !== undefined &&
    value !== null &&
    typeof value === "object" &&
    Array.isArray(value) &&
    !isEnum ? value.every((item) => validatePrimitive(item, type)) : value.every((item : any) => validateEnum(item, type))
  );
};

export const validateFileType = (mimetype: string): boolean => {
  return allowableContentTypes.has(mimetype);
};

export const validateDate = (value: any): boolean => {
  return !Number.isNaN(Date.parse(value));
};

export const getApiValidationError = (
  fieldName: string,
  type: Type,
  isArray = false,
): string => {
  return `The ${fieldName} is not a ${type}${isArray ? " Array" : ""}`;
};

export const getFileTypeValidationError = (mimetype: string): string => {
  const allowableContentTypesString = [...allowableContentTypes].join(", ");
  return `The file type ${mimetype} is not one of ${allowableContentTypesString}`;
};
