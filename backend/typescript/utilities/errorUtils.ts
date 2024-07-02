/* eslint-disable-next-line import/prefer-default-export */
export const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : "Unknown error occurred.";
};

// Thrown when resource is not found
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}
export const INTERNAL_SERVER_ERROR_MESSAGE = "Internal server error occured.";
