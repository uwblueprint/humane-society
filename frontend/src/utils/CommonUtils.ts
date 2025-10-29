import AUTHENTICATED_USER_KEY from "../constants/AuthConstants";
import { AuthenticatedUser } from "../types/AuthTypes";
import { getLocalStorageObj } from "./LocalStorageUtils";

export const getCurrentUserRole = (): string | null => {
  const currentUser = getLocalStorageObj<AuthenticatedUser>(
    AUTHENTICATED_USER_KEY,
  );
  return currentUser?.role || null;
};

export const MONTH_NAME_TO_NUMBER: Record<string, number> = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

export const MONTH_NUMBER_TO_NAME: Record<number, string> = Object.fromEntries(
  Object.entries(MONTH_NAME_TO_NUMBER).map(([name, num]) => [num, name]),
) as Record<number, string>;

export const getDaysInMonth = (
  month: string | number,
  year?: number,
): number => {
  // Setting day = 0 gives the last day of the previous month
  const daysInMonth = new Date(
    year ?? 4, // If year is undefined, we assume we are in a leap year for as many dates as possible
    typeof month === "string" ? MONTH_NAME_TO_NUMBER[month] : month,
    0,
  ).getDate();
  return daysInMonth;
};

export const getAge = (birthday: string): number => {
  const parsedBirthday = Date.parse(birthday);
  const currentDate = new Date();
  const ageInMs = currentDate.valueOf() - parsedBirthday.valueOf();
  const msInYear = 1000 * 60 * 60 * 24 * 365.25;
  return ageInMs / msInYear;
};
