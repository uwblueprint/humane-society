import { DateTime } from "luxon";
import { ColorLevel } from "../types";
import logger from "./logger";

const Logger = logger(__filename);
const TIME_ZONE = "America/New_York";

export function dateToTimeString(date: DateTime): string {
  return date.setZone(TIME_ZONE).toFormat("t");
}

export function timeStringToDate(timeStr: string): DateTime {
  const currentTime = DateTime.now().setZone(TIME_ZONE);
  const fullDateString = `${currentTime.toFormat("DDDD")} ${timeStr}`;

  try {
    return DateTime.fromFormat(fullDateString, "DDDD t");
  } catch (error: unknown) {
    Logger.error(`Failed to parse time string: ${timeStr}. Reason = ${error}`);
    throw error;
  }
}

export function colorLevelToEnum(colorLevel: number): ColorLevel {
  // values in descending order
  return Object.values(ColorLevel)[5 - colorLevel];
}
