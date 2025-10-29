import { getDaysInMonth, getAge } from "../CommonUtils";

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

  describe("getAge", () => {
    // Freeze current date to make test results deterministic
    const mockToday = new Date("2025-10-29T00:00:00Z");

    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(mockToday);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it("returns 0 for a birthday today", () => {
      expect(getAge("2025-10-29")).toBeCloseTo(0, 5);
    });

    it("returns approximately 1 for a birthday one year ago", () => {
      expect(getAge("2024-10-29")).toBeCloseTo(1, 2);
    });

    it("returns about 0.5 for a birthday six months ago", () => {
      expect(getAge("2025-04-29")).toBeCloseTo(0.5, 2);
    });

    it("returns about 25 for a 25-year-old birthday", () => {
      expect(getAge("2000-10-29")).toBeCloseTo(25, 1);
    });

    it("handles leap years correctly", () => {
      jest.setSystemTime(new Date("2025-02-28T00:00:00Z"));
      expect(getAge("2004-02-29")).toBeCloseTo(21, 1);
      jest.setSystemTime(mockToday);
    });

    it("returns fractional years for non-exact birthdays", () => {
      expect(getAge("2015-06-10")).toBeCloseTo(10.38, 1);
    });
  });
});
