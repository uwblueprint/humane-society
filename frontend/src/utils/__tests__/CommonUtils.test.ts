import { getDaysInMonth } from "../CommonUtils";

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
});
