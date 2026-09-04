import { DateTime } from "luxon";
import { Cadence, Days } from "../types";

const SHELTER_TIME_ZONE = "America/New_York";

export const dayNameToIndex = {
  [Days.SUN]: 0,
  [Days.MON]: 1,
  [Days.TUE]: 2,
  [Days.WED]: 3,
  [Days.THU]: 4,
  [Days.FRI]: 5,
  [Days.SAT]: 6,
};

export const dayIndexToName = {
  0: Days.SUN,
  1: Days.MON,
  2: Days.TUE,
  3: Days.WED,
  4: Days.THU,
  5: Days.FRI,
  6: Days.SAT,
};

export const getUTCDayLabel = (date: Date) => {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
};

export const getShelterDayLabelInUTC = (moment: Date): Date => {
  const zoned = DateTime.fromJSDate(moment, { zone: SHELTER_TIME_ZONE });
  return new Date(Date.UTC(zoned.year, zoned.month - 1, zoned.day));
};

// shelterDayLabelUTC: shelter calendar day, represented at UTC midnight
// timeSource: instant from which the shelter-local time is extracted
export const buildShelterInstant = (
  shelterDayLabelUTC: Date,
  timeSource: Date,
): Date => {
  const timeZoned = DateTime.fromJSDate(timeSource, {
    zone: SHELTER_TIME_ZONE,
  });
  return DateTime.fromObject(
    {
      year: shelterDayLabelUTC.getUTCFullYear(),
      month: shelterDayLabelUTC.getUTCMonth() + 1,
      day: shelterDayLabelUTC.getUTCDate(),
      hour: timeZoned.hour,
      minute: timeZoned.minute,
      second: timeZoned.second,
      millisecond: timeZoned.millisecond,
    },
    { zone: SHELTER_TIME_ZONE },
  ).toJSDate();
};

export const isDateInRecurrence = (
  startDate: Date,
  endDate: Date,
  cadence: Cadence,
): boolean => {
  // Reset the date to start at midnight to avoid off by one day errors
  const start = getUTCDayLabel(startDate);
  const end = getUTCDayLabel(endDate);

  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const millisecondsInBetween = end.getTime() - start.getTime();
  const daysDiff = Math.floor(millisecondsInBetween / millisecondsPerDay);

  let isMatch = false;
  switch (cadence) {
    case Cadence.WEEKLY:
      isMatch = daysDiff % 7 === 0;
      break;
    case Cadence.BIWEEKLY:
      isMatch = daysDiff % 14 === 0;
      break;
    case Cadence.MONTHLY: {
      const monthsDiff =
        (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
        (end.getUTCMonth() - start.getUTCMonth());
      isMatch = monthsDiff >= 0 && end.getUTCDate() === start.getUTCDate();
      break;
    }
    case Cadence.ANNUALLY:
      isMatch =
        end.getUTCMonth() === start.getUTCMonth() &&
        end.getUTCDate() === start.getUTCDate() &&
        end.getUTCFullYear() >= start.getUTCFullYear();
      break;
    default:
      break;
  }

  return isMatch;
};

export function buildStartDates(actualStart: Date, days: Days[]): Date[] {
  const start = getUTCDayLabel(actualStart);
  const startDay = start.getUTCDay(); // 0..6

  const uniqueDays = Array.from(new Set(days)); // avoid duplicates
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const dates = uniqueDays.map((d) => {
    const targetDay = dayNameToIndex[d];
    const delta = (targetDay - startDay + 7) % 7; // 0..6
    return new Date(start.getTime() + delta * millisecondsPerDay);
  });

  dates.sort((a, b) => a.getTime() - b.getTime());
  return dates;
}

export function matchesRecurrenceRule(
  actualStartShelterDayLabelUTC: Date,
  targetShelterDayLabelUTC: Date,
  recurrence: {
    days?: Days[] | null;
    cadence: Cadence;
    end_date?: Date | null;
    exclusions?: Date[] | null;
  },
): boolean {
  const start = getUTCDayLabel(actualStartShelterDayLabelUTC);
  const target = getUTCDayLabel(targetShelterDayLabelUTC);

  if (target < start) return false;

  if (
    recurrence.end_date &&
    target > getUTCDayLabel(new Date(recurrence.end_date))
  ) {
    return false;
  }

  if (
    recurrence.exclusions?.some(
      (ex) => getUTCDayLabel(new Date(ex)).getTime() === target.getTime(),
    )
  ) {
    return false;
  }

  const startDates =
    recurrence.days && recurrence.days.length > 0
      ? buildStartDates(start, recurrence.days)
      : [start];

  return startDates.some((sd) =>
    isDateInRecurrence(sd, target, recurrence.cadence),
  );
}
