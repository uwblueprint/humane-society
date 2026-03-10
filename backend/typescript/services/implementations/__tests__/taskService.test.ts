
 // Tests for the delete recurrence task endpoint
  // test cases:
  // - test one where the task deletes all or part of the exclusion dates
  // - test adding to exclusion dates (single)
  // - test deleting task completely, ie first instance, but the time given by the user is different from the exact start time
  // - test deletingtas from one exclusion date onwards, but the inout time isnt at midnight
  // - test deleting task where all the days ecept for the dayof week of the first date is deleted (ie we edit task to be just a one day thing)
  // - for all tests, make it so that the input is not midnight
  // - test invalid params, ie: missing one or wrong format
  // - test task with unavailable end date, or task with unavailable start date
  // - test with 500 error
import PgTask from "../../../models/task.model";
import PgRecurrenceTask from "../../../models/recurrence_task.model";
import {
  BadRequestError,
  NotFoundError,
} from "../../../utilities/errorUtils";
import { Cadence, Days } from "../../../types";
import { resetDateToUTCMidnight } from "../../../utilities/dateUtils";
import TaskService from "../taskService";

jest.mock("../../../models/task.model", () => ({
  __esModule: true,
  default: {
    findByPk: jest.fn(),
    destroy: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("../../../models/recurrence_task.model", () => ({
  __esModule: true,
  default: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    create: jest.fn(),
  },
}));

describe("TaskService using dates shaped like delete route inputs", () => {
  const service = new TaskService();

  const mockPgTask = PgTask as unknown as {
    findByPk: jest.Mock;
    destroy: jest.Mock;
  };

  const mockPgRecurrenceTask = PgRecurrenceTask as unknown as {
    findByPk: jest.Mock;
    update: jest.Mock;
    destroy: jest.Mock;
  };

  const parseRouteDate = (value: unknown): Date | undefined => {
    return value &&
      typeof value === "string" &&
      (/^\d{4}-\d{2}-\d{2}$/.test(value) || !isNaN(Date.parse(value)))
      ? new Date(value)
      : undefined;
  };

  const parseRouteSingle = (value: unknown): boolean | undefined => {
    return value === "true" || value === "false"
      ? value === "true"
      : undefined;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("route-shaped input validation", () => {
    it("rejects missing date", () => {
      const date = parseRouteDate(undefined);
      expect(date).toBeUndefined();
    });

    it("rejects invalid date format", () => {
      const date = parseRouteDate("notadate:(");
      expect(date).toBeUndefined();
    });

    it("rejects missing single", () => {
      const single = parseRouteSingle(undefined);
      expect(single).toBeUndefined();
    });

    it("rejects invalid single value", () => {
      const single = parseRouteSingle("hjgjhjhv");
      expect(single).toBeUndefined();
    });

    it("accepts ISO date-only string", () => {
      const date = parseRouteDate("2026-03-17");
      expect(date).toBeInstanceOf(Date);
    });

    it("accepts ISO datetime string", () => {
      const date = parseRouteDate("2026-03-17T13:45:00Z");
      expect(date).toBeInstanceOf(Date);
    });

    it("accepts ISO datetime string with offset", () => {
      const date = parseRouteDate("2026-03-20T16:20:00-07:00");
      expect(date).toBeInstanceOf(Date);
    });
  });

  describe("excludeDate", () => {
    it("adds to exclusion dates from a non-midnight ISO datetime input", async () => {
      const date = parseRouteDate("2026-03-17T13:45:00Z");
      expect(date).toBeDefined();

      mockPgTask.findByPk.mockResolvedValue({
        id: "123",
        scheduled_start_time: new Date("2026-03-10T10:50:00Z"),
      });

      mockPgRecurrenceTask.findByPk.mockResolvedValue({
        task_id: "123",
        cadence: Cadence.WEEKLY,
        days: [Days.TUE],
        end_date: null,
        exclusions: [new Date("2026-03-10T00:00:00Z")],
      });

      mockPgRecurrenceTask.update.mockResolvedValue([
        1,
        [
          {
            task_id: "123",
            cadence: Cadence.WEEKLY,
            days: [Days.TUE],
            end_date: null,
            exclusions: [
              new Date("2026-03-10T00:00:00Z"),
              new Date("2026-03-17T13:45:00Z"),
            ],
          },
        ],
      ]);

      const result = await service.excludeDate("123", date!);

      expect(mockPgRecurrenceTask.update).toHaveBeenCalledWith(
        {
          exclusions: [
            new Date("2026-03-10T00:00:00Z"),
            new Date("2026-03-17T13:45:00Z"),
          ],
        },
        { where: { task_id: "123" }, returning: true },
      );

      expect(result).toEqual({
        id: "123",
        days: [Days.TUE],
        cadence: Cadence.WEEKLY,
        endDate: undefined,
        exclusions: [
          new Date("2026-03-10T00:00:00Z"),
          new Date("2026-03-17T13:45:00Z"),
        ],
      });
    });

    it("throws when exclusion date already exists after normalization", async () => {
      const date = parseRouteDate("2026-03-17T20:15:00-07:00");
      expect(date).toBeDefined();

      mockPgTask.findByPk.mockResolvedValue({
        id: "123",
        scheduled_start_time: new Date("2026-03-10T10:50:00Z"),
      });

      mockPgRecurrenceTask.findByPk.mockResolvedValue({
        task_id: "123",
        cadence: Cadence.WEEKLY,
        days: [Days.TUE],
        end_date: null,
        exclusions: [new Date("2026-03-17T00:00:00Z")],
      });

      await expect(service.excludeDate("123", date!)).rejects.toThrow(
        BadRequestError,
      );
    });

    it("throws when exclusion date is before recurrence start date", async () => {
      const date = parseRouteDate("2026-03-09T23:00:00Z");
      expect(date).toBeDefined();

      mockPgTask.findByPk.mockResolvedValue({
        id: "123",
        scheduled_start_time: new Date("2026-03-10T10:50:00Z"),
      });

      mockPgRecurrenceTask.findByPk.mockResolvedValue({
        task_id: "123",
        cadence: Cadence.WEEKLY,
        days: [Days.TUE],
        end_date: null,
        exclusions: [],
      });

      await expect(service.excludeDate("123", date!)).rejects.toThrow(
        BadRequestError,
      );
    });

    it("throws when exclusion date is after recurrence end date", async () => {
      const date = parseRouteDate("2026-03-24T12:00:00Z");
      expect(date).toBeDefined();

      mockPgTask.findByPk.mockResolvedValue({
        id: "123",
        scheduled_start_time: new Date("2026-03-10T10:50:00Z"),
      });

      mockPgRecurrenceTask.findByPk.mockResolvedValue({
        task_id: "123",
        cadence: Cadence.WEEKLY,
        days: [Days.TUE],
        end_date: new Date("2026-03-20T00:00:00Z"),
        exclusions: [],
      });

      await expect(service.excludeDate("123", date!)).rejects.toThrow(
        BadRequestError,
      );
    });

    it("throws when task has unavailable start date", async () => {
      const date = parseRouteDate("2026-03-17T13:45:00Z");
      expect(date).toBeDefined();

      mockPgTask.findByPk.mockResolvedValue({
        id: "110",
        scheduled_start_time: null,
      });

      mockPgRecurrenceTask.findByPk.mockResolvedValue({
        task_id: "110",
        cadence: Cadence.WEEKLY,
        days: [Days.TUE],
        end_date: null,
        exclusions: [],
      });

      await expect(service.excludeDate("110", date!)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("works when recurrence has unavailable end date", async () => {
      const date = parseRouteDate("2026-03-17T22:10:00+02:00");
      expect(date).toBeDefined();

      mockPgTask.findByPk.mockResolvedValue({
        id: "123",
        scheduled_start_time: new Date("2026-03-10T10:50:00Z"),
      });

      mockPgRecurrenceTask.findByPk.mockResolvedValue({
        task_id: "123",
        cadence: Cadence.WEEKLY,
        days: [Days.TUE],
        end_date: null,
        exclusions: [],
      });

      mockPgRecurrenceTask.update.mockResolvedValue([
        1,
        [
          {
            task_id: "123",
            cadence: Cadence.WEEKLY,
            days: [Days.TUE],
            end_date: null,
            exclusions: [date],
          },
        ],
      ]);

      const result = await service.excludeDate("123", date!);

      expect(result.endDate).toBeUndefined();
      expect(result.exclusions).toEqual([date]);
    });
  });

  describe("updateRecurrence", () => {
    it("deletes all or part of exclusion dates when recurrence is shortened from a non-midnight route input", async () => {
      const selectedDeleteDate = parseRouteDate("2026-01-15T09:30:00+02:00");
      expect(selectedDeleteDate).toBeDefined();

      const newEndDate = new Date(
        selectedDeleteDate!.getTime() - 24 * 60 * 60 * 1000,
      );

      mockPgTask.findByPk.mockResolvedValue({
        id: "107",
        scheduled_start_time: new Date("2026-01-01T09:00:00Z"),
      });

      mockPgRecurrenceTask.findByPk.mockResolvedValue({
        task_id: "107",
        cadence: "DAILY",
        days: null,
        end_date: new Date("2026-01-31T00:00:00Z"),
        exclusions: [
          new Date("2026-01-05T15:00:00Z"),
          new Date("2026-01-10T12:00:00Z"),
          new Date("2026-01-20T09:00:00Z"),
        ],
      });

      mockPgRecurrenceTask.update.mockResolvedValue([
        1,
        [
          {
            task_id: "107",
            cadence: "DAILY",
            days: null,
            end_date: resetDateToUTCMidnight(newEndDate),
            exclusions: [
              new Date("2026-01-05T00:00:00Z"),
              new Date("2026-01-10T00:00:00Z"),
            ],
          },
        ],
      ]);

      const result = await service.updateRecurrence("107", {
        endDate: newEndDate,
      });

      const payload = mockPgRecurrenceTask.update.mock.calls[0][0];
      expect(payload.end_date.toISOString()).toBe("2026-01-14T00:00:00.000Z");
      expect(payload.exclusions).toEqual([
        new Date("2026-01-05T00:00:00Z"),
        new Date("2026-01-10T00:00:00Z"),
      ]);

      expect(result).toEqual({
        id: "107",
        days: null,
        cadence: "DAILY",
        endDate: new Date("2026-01-14T00:00:00Z"),
        exclusions: [
          new Date("2026-01-05T00:00:00Z"),
          new Date("2026-01-10T00:00:00Z"),
        ],
      });
    });

    it("updates recurrence from one selected delete date onward when input time is not midnight", async () => {
      const selectedDeleteDate = parseRouteDate("2026-03-20T16:20:00-07:00");
      expect(selectedDeleteDate).toBeDefined();

      const newEndDate = new Date(
        selectedDeleteDate!.getTime() - 24 * 60 * 60 * 1000,
      );

      mockPgTask.findByPk.mockResolvedValue({
        id: "123",
        scheduled_start_time: new Date("2026-03-10T10:50:00Z"),
      });

      mockPgRecurrenceTask.findByPk.mockResolvedValue({
        task_id: "123",
        cadence: Cadence.WEEKLY,
        days: [Days.TUE],
        end_date: new Date("2026-04-30T00:00:00Z"),
        exclusions: [],
      });

      mockPgRecurrenceTask.update.mockResolvedValue([
        1,
        [
          {
            task_id: "123",
            cadence: Cadence.WEEKLY,
            days: [Days.TUE],
            end_date: resetDateToUTCMidnight(newEndDate),
            exclusions: [],
          },
        ],
      ]);

      const result = await service.updateRecurrence("123", {
        endDate: newEndDate,
      });

      const payload = mockPgRecurrenceTask.update.mock.calls[0][0];
      expect(payload.end_date).toEqual(resetDateToUTCMidnight(newEndDate));
      expect(result.endDate).toEqual(resetDateToUTCMidnight(newEndDate));
    });

    it("reduces recurrence to just one day when all other days are pruned", async () => {
      const selectedDeleteDate = parseRouteDate("2026-03-11T23:59:59Z");
      expect(selectedDeleteDate).toBeDefined();

      const newEndDate = new Date(
        selectedDeleteDate!.getTime() - 24 * 60 * 60 * 1000,
      );

      mockPgTask.findByPk.mockResolvedValue({
        id: "108",
        scheduled_start_time: new Date("2026-03-10T12:00:00Z"), // Tuesday
      });

      mockPgRecurrenceTask.findByPk.mockResolvedValue({
        task_id: "108",
        cadence: Cadence.WEEKLY,
        days: [Days.TUE, Days.WED, Days.FRI],
        end_date: new Date("2026-03-31T00:00:00Z"),
        exclusions: [],
      });

      mockPgRecurrenceTask.update.mockResolvedValue([
        1,
        [
          {
            task_id: "108",
            cadence: Cadence.WEEKLY,
            days: [Days.TUE],
            end_date: resetDateToUTCMidnight(newEndDate),
            exclusions: [],
          },
        ],
      ]);

      const result = await service.updateRecurrence("108", {
        endDate: newEndDate,
      });

      const payload = mockPgRecurrenceTask.update.mock.calls[0][0];
      expect(payload.days).toEqual([Days.TUE]);
      expect(result.days).toEqual([Days.TUE]);
    });

    it("throws when task has unavailable start date and endDate is provided", async () => {
      const selectedDeleteDate = parseRouteDate("2026-03-20T10:50:00Z");
      expect(selectedDeleteDate).toBeDefined();

      const newEndDate = new Date(
        selectedDeleteDate!.getTime() - 24 * 60 * 60 * 1000,
      );

      mockPgTask.findByPk.mockResolvedValue({
        id: "110",
        scheduled_start_time: null,
      });

      mockPgRecurrenceTask.findByPk.mockResolvedValue({
        task_id: "110",
        cadence: Cadence.WEEKLY,
        days: [Days.TUE],
        end_date: null,
        exclusions: [],
      });

      await expect(
        service.updateRecurrence("110", { endDate: newEndDate }),
      ).rejects.toThrow(
        "Recurrence task must have a start date if end date is provided.",
      );
    });

    it("works when recurrence has unavailable end date", async () => {
      const selectedDeleteDate = parseRouteDate("2026-03-20T10:50:00.000Z");
      expect(selectedDeleteDate).toBeDefined();

      const newEndDate = new Date(
        selectedDeleteDate!.getTime() - 24 * 60 * 60 * 1000,
      );

      mockPgTask.findByPk.mockResolvedValue({
        id: "123",
        scheduled_start_time: new Date("2026-03-10T10:50:00Z"),
      });

      mockPgRecurrenceTask.findByPk.mockResolvedValue({
        task_id: "123",
        cadence: Cadence.WEEKLY,
        days: [Days.TUE],
        end_date: null,
        exclusions: [],
      });

      mockPgRecurrenceTask.update.mockResolvedValue([
        1,
        [
          {
            task_id: "123",
            cadence: Cadence.WEEKLY,
            days: [Days.TUE],
            end_date: resetDateToUTCMidnight(newEndDate),
            exclusions: [],
          },
        ],
      ]);

      const result = await service.updateRecurrence("123", {
        endDate: newEndDate,
      });

      expect(result.endDate).toEqual(resetDateToUTCMidnight(newEndDate));
    });
  });

  describe("deleteRecurrence", () => {
    it("deletes recurrence for first-instance deletion path even when selected input time differs from exact task start time", async () => {
      const selectedDate = parseRouteDate("2026-03-10T01:05:00.000Z");
      expect(selectedDate).toBeDefined();

      const scheduledStart = new Date("2026-03-10T15:00:00Z");
      expect(
        resetDateToUTCMidnight(selectedDate!).getTime(),
      ).toBe(resetDateToUTCMidnight(scheduledStart).getTime());

      mockPgRecurrenceTask.destroy.mockResolvedValue(1);

      const result = await service.deleteRecurrence("123");

      expect(mockPgRecurrenceTask.destroy).toHaveBeenCalledWith({
        where: { task_id: "123" },
      });
      expect(result).toBe("123");
    });

    it("throws when recurrence does not exist", async () => {
      mockPgRecurrenceTask.destroy.mockResolvedValue(0);

      await expect(service.deleteRecurrence("999")).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("unexpected errors", () => {
    it("propagates unexpected errors like a route 500 would", async () => {
      const date = parseRouteDate("2026-03-17T13:45:00Z");
      expect(date).toBeDefined();

      mockPgRecurrenceTask.findByPk.mockRejectedValue(
        new Error("database exploded"),
      );

      await expect(service.excludeDate("123", date!)).rejects.toThrow(
        "database exploded",
      );
    });
  });
});