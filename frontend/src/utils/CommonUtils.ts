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

// Return the age in months floored
// Ex. Birthday: 2025-07-30, Today: 2025-10-29 --> 2 months
export const getAgeInMonths = (birthday: string): number => {
  // Unfortunately, dates in the form of strings like YYYY-MM-DD are often interpreted as UTC
  // so something like new Date("2024-01-01") will be interpreted as 2023-12-31 19:00 in EST

  // We make an assumption that dates are returned in "YYYY-MM-DD" which should be true from sequelize
  // To fix this, we instead use the year, month, and day
  const [year, month, day] = birthday.split("-").map((str) => Number(str));
  const birthDate = new Date(year, month - 1, day); // Months are 0 indexed
  const now = new Date();

  const years = now.getFullYear() - birthDate.getFullYear();
  let months = now.getMonth() - birthDate.getMonth();

  if (now.getDate() < birthDate.getDate()) {
    months -= 1;
  }

  const totalMonths = years * 12 + months;

  return totalMonths;
};
