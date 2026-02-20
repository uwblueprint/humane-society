import { Cadence, Days } from "../types";

export const dayNameToIndex = {
  [Days.SUN]: 0, [Days.MON]: 1, [Days.TUE]: 2, [Days.WED]: 3, [Days.THU]: 4, [Days.FRI]: 5, [Days.SAT]: 6
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

export const resetDateToUTCMidnight = (date: Date) => {
    return new Date(Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate()
    ));
};

export const isDateInRecurrence = (startDate: Date, endDate: Date, cadence: Cadence): boolean => {
    // Reset the date to start at midnight to avoid off by one day errors
    const start = resetDateToUTCMidnight(startDate);
    const end = resetDateToUTCMidnight(endDate);

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const millisecondsInBetween = end.getTime() - start.getTime();
    const daysDiff = Math.floor(millisecondsInBetween / millisecondsPerDay);

    let isMatch = false;
    switch (cadence) {
        case Cadence.WEEKLY:
        return daysDiff % 7 === 0;

        case Cadence.BIWEEKLY:
        return daysDiff % 14 === 0;

        case Cadence.MONTHLY: {
        const monthsDiff =
            (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
            (end.getUTCMonth() - start.getUTCMonth());
        return monthsDiff >= 0 && end.getUTCDate() === start.getUTCDate();
        }

        case Cadence.ANNUALLY:
            isMatch =
            end.getUTCMonth() === start.getUTCMonth() &&
            end.getUTCDate() === start.getUTCDate() &&
            end.getUTCFullYear() >= start.getUTCFullYear();
            break;
    }

    return isMatch;
}

export function buildStartDates(actualStart: Date, days: Days[]): Date[] {
    const start = resetDateToUTCMidnight(actualStart);
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
