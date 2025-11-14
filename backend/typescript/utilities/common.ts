import { DateTime } from "luxon";
import { ColorLevel } from "../types";
import logger from "./logger";

const Logger = logger(__filename);
const TIME_ZONE = "America/New_York";

/**
 * Converts a Luxon DateTime to a display string for the UI.
 * Example output: "9:05 PM"
 */
export function dateToTimeString(date: DateTime): string {
  return date.setZone(TIME_ZONE).toFormat("t"); // short time format
}

/**
 * Converts a UI display time string (e.g., "9:05 PM") to a DateTime for today.
 * Useful if user inputs a time without a date.
 */
export function timeStringToDateTime(timeStr: string): DateTime {
  const today = DateTime.now().setZone(TIME_ZONE);
  const fullDateString = `${today.toFormat("DDDD")} ${timeStr}`;
  const dt = DateTime.fromFormat(fullDateString, "DDDD t", { zone: TIME_ZONE });
  if (!dt.isValid) {
    throw new Error(`Failed to parse time string: ${timeStr}`);
  }
  return dt;
}

/**
 * Converts a Luxon DateTime to an ISO string for storage/comparison.
 * Example output: "2025-11-02T21:05:00-05:00"
 */
export function dateToISOString(date: DateTime): string {
  const iso = date.toISO();
  if (!iso) {
    throw new Error(`Invalid DateTime, cannot convert to ISO string: ${date}`);
  }
  return iso;
}

/**
 * Converts an ISO string back to a Luxon DateTime object for comparisons or arithmetic.
 * Throws an error if parsing fails.
 */
export function isoStringToDateTime(isoString: string): DateTime {
  const dt = DateTime.fromISO(isoString, { zone: TIME_ZONE });
  if (!dt.isValid) {
    throw new Error(`Invalid ISO datetime string: ${isoString}`);
  }
  return dt;
}

export function colorLevelToEnum(colorLevel: number): ColorLevel {
  // values in descending order
  return Object.values(ColorLevel)[5 - colorLevel];
}
