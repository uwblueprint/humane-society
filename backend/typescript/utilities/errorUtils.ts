export const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : "Unknown error occurred.";
};

export const INTERNAL_SERVER_ERROR_MESSAGE = "Internal server error occured.";

// Thrown when resource is not found
export { default as NotFoundError } from "./notFoundError";

// Thrown when a task already has a recurrence rule
export { default as ConflictError } from "./conflictError";

export { default as BadRequestError } from "./badRequestError";
