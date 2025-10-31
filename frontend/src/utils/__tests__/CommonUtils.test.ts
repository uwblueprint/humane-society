import { getDaysInMonth, getAgeInMonths } from "../CommonUtils";

describe("CommonUtils", () => {
  describe("getDaysInMonth", () => {
    it("should return 31 for January", () => {
      expect(getDaysInMonth("January", 2023)).toBe(31);
    });

    it("should return 28 for February in a non-leap year", () => {
      expect(getDaysInMonth("February", 2023)).toBe(28);
    });

    it("should return 29 for February in a leap year", () => {
      expect(getDaysInMonth("February", 2024)).toBe(29);
    });

    it("should return 30 for April", () => {
      expect(getDaysInMonth("April", 2023)).toBe(30);
    });

    it("should return 31 for December", () => {
      expect(getDaysInMonth("December", 2023)).toBe(31);
    });

    it("should handle century years that are not leap years (e.g., 1900)", () => {
      expect(getDaysInMonth("February", 1900)).toBe(28); // 1900 is not a leap year
    });

    it("should handle century years that are leap years (e.g., 2000)", () => {
      expect(getDaysInMonth("February", 2000)).toBe(29); // 2000 is a leap year
    });

    describe("undefined year", () => {
      it("should return 31 for January", () => {
        expect(getDaysInMonth("January")).toBe(31);
      });

      it("should return 29 for February", () => {
        expect(getDaysInMonth("February")).toBe(29);
      });
    });
  });

  describe("getAgeInMonths", () => {
    // Freeze current date to make test results deterministic
    const mockToday = new Date(2025, 9, 29); // 2025-10-29 (months are 0 indexed)

    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(mockToday);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it("returns 0 for a birthday today", () => {
      expect(getAgeInMonths("2025-10-29")).toBe(0);
    });

    it("returns 12 for a birthday one year ago", () => {
      expect(getAgeInMonths("2024-10-29")).toBe(12);
    });

    it("returns 6 for a birthday six months ago", () => {
      expect(getAgeInMonths("2025-04-29")).toBe(6);
    });

    it("returns 5 for a birthday one day after 6 months ago", () => {
      expect(getAgeInMonths("2025-04-30")).toBe(5);
    });

    it("handles beginning of the year birthdays", () => {
      expect(getAgeInMonths("2000-01-01")).toBe(309);
    });

    it("returns about 25 for a 25-year-old birthday", () => {
      expect(getAgeInMonths("2000-10-15")).toBe(300);
    });

    it("handles leap years correctly", () => {
      jest.setSystemTime(new Date(2025, 1, 28)); // 2025-02-28 (months are 0 indexed)
      expect(getAgeInMonths("2004-02-29")).toBe(251);
      jest.setSystemTime(mockToday);
    });

    it("handles leap year birthdays correctly with regular today date", () => {
      expect(getAgeInMonths("2004-02-29")).toBe(260);
    });
  });
});
