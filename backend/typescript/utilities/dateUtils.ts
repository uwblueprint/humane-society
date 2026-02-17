import { Cadence } from "../types";

const resetDateToUTCMidnight = (date: Date) => {
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
        return Math.floor(daysDiff / 7) % 1 === 0;

        case Cadence.BIWEEKLY:
        return Math.floor(daysDiff / 7) % 2 === 0;

        case Cadence.MONTHLY: {
            const monthsDiff =
            (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
            (end.getUTCMonth() - start.getUTCMonth());
            isMatch =
            monthsDiff >= 0 &&
            end.getUTCDate() === start.getUTCDate();
            break;
        }
        case Cadence.ANNUALLY:
            isMatch =
            end.getUTCMonth() === start.getUTCMonth() &&
            end.getUTCDate() === start.getUTCDate() &&
            end.getUTCFullYear() > start.getUTCFullYear();
            break;
    }

    return isMatch;
}

