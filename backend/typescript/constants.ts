export const MIN_COLOR_LEVEL = 1;
export const MAX_COLOR_LEVEL = 5;

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg"];

export { MAX_FILE_SIZE_MB, MAX_FILE_SIZE_BYTES, ACCEPTED_TYPES };

// below constants are not currently in use (for old migration files)
export const MIN_BEHAVIOUR_LEVEL = 1;
export const MAX_BEHAVIOUR_LEVEL = 4;
