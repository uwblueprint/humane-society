import { Request, Response } from "express";

// taskRoutes.ts constructs concrete service instances at import time
// (`new TaskService()`, etc.), so every service it touches must be mocked
// before taskRoutes is imported below.
jest.mock("../../middlewares/auth", () => ({
  __esModule: true,
  isAuthorizedByRole: () => (_req: Request, _res: Response, next: () => void) =>
    next(),
  isAuthorizedToAssignTask:
    () => (_req: Request, _res: Response, next: () => void) =>
      next(),
  getAccessToken: () => "test-token",
}));

const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
jest.mock("../../models", () => ({
  __esModule: true,
  sequelize: {
    transaction: jest.fn().mockResolvedValue(mockTransaction),
  },
}));

jest.mock("../../services/implementations/taskService");
jest.mock("../../services/implementations/petService");
jest.mock("../../services/implementations/taskTemplateService");
jest.mock("../../services/implementations/userService");
jest.mock("../../services/implementations/authService");

jest.mock("../../services/implementations/interactionService", () => ({
  __esModule: true,
  default: {
    log: jest.fn(),
    hasTaskInteraction: jest.fn().mockResolvedValue(false),
    getInteractionTypeId: jest.fn().mockResolvedValue(1),
  },
}));

// eslint-disable-next-line import/first
import taskRouter from "../taskRoutes";
// eslint-disable-next-line import/first
import TaskService from "../../services/implementations/taskService";
// eslint-disable-next-line import/first
import PetService from "../../services/implementations/petService";
// eslint-disable-next-line import/first
import TaskTemplateService from "../../services/implementations/taskTemplateService";
// eslint-disable-next-line import/first
import AuthService from "../../services/implementations/authService";
// eslint-disable-next-line import/first
import InteractionService from "../../services/implementations/interactionService";
// eslint-disable-next-line import/first
import { Cadence } from "../../types";

// Router internals aren't part of Express's public types, hence the `any`s below.
/* eslint-disable @typescript-eslint/no-explicit-any */
const editLayer = (taskRouter as any).stack.find(
  (layer: any) => layer.route?.path === "/recurrences/:taskId/edit",
);
const editHandler = editLayer.route.stack[editLayer.route.stack.length - 1]
  .handle as (req: Request, res: Response) => Promise<void>;

const makeRes = (): Response => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res as Response;
};

const makeReq = (body: unknown): Request =>
  ({
    params: { taskId: "1" },
    query: { date: "2026-01-05", single: "false" },
    body,
    headers: { authorization: "Bearer test-token" },
  } as unknown as Request);
/* eslint-enable @typescript-eslint/no-explicit-any */

describe("POST /tasks/recurrences/:taskId/edit — recurrence endDate logging", () => {
  const mockTaskServiceProto =
    TaskService.prototype as jest.Mocked<TaskService>;
  const mockPetServiceProto = PetService.prototype as jest.Mocked<PetService>;
  const mockTaskTemplateServiceProto =
    TaskTemplateService.prototype as jest.Mocked<TaskTemplateService>;
  const mockAuthServiceProto =
    AuthService.prototype as jest.Mocked<AuthService>;
  const mockLog = InteractionService.log as jest.Mock;

  const seedTask = {
    id: 1,
    petId: 1,
    taskTemplateId: 1,
    userId: 1,
    scheduledStartTime: new Date("2026-01-05T00:00:00.000Z"),
    scheduledEndTime: undefined,
    startTime: undefined,
    endTime: undefined,
    notes: "original notes",
  };

  beforeEach(() => {
    mockTaskServiceProto.getTask.mockResolvedValue(seedTask as any);
    mockTaskServiceProto.updateTask.mockResolvedValue(seedTask as any);
    mockPetServiceProto.getPet.mockResolvedValue({ name: "Fido" } as any);
    mockTaskTemplateServiceProto.getTaskTemplate.mockResolvedValue({
      taskName: "Feed",
    } as any);
    mockAuthServiceProto.getUserIdByToken.mockResolvedValue("42");
  });

  it("logs CHANGED_TASK_END_DATE when clearing an existing endDate to null", async () => {
    mockTaskServiceProto.getRecurrence.mockResolvedValue({
      days: [],
      cadence: Cadence.WEEKLY,
      endDate: new Date("2026-06-01T00:00:00.000Z"),
      exclusions: [],
    } as any);
    mockTaskServiceProto.updateRecurrence.mockResolvedValue({
      days: [],
      cadence: Cadence.WEEKLY,
      endDate: undefined,
      exclusions: [],
    } as any);

    const req = makeReq({ endDate: null });
    const res = makeRes();

    await editHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockLog).toHaveBeenCalledWith(
      expect.objectContaining({
        targetTaskId: 1,
        short_description:
          "Changed task end date of Feed with Fido to indefinite",
        long_description:
          "The end date of Feed with Fido changed from 06/01/2026 to indefinite.",
      }),
    );
  });

  it("logs CHANGED_TASK_END_DATE when setting an indefinite recurrence to a real date", async () => {
    mockTaskServiceProto.getRecurrence.mockResolvedValue({
      days: [],
      cadence: Cadence.WEEKLY,
      endDate: undefined,
      exclusions: [],
    } as any);
    mockTaskServiceProto.updateRecurrence.mockResolvedValue({
      days: [],
      cadence: Cadence.WEEKLY,
      endDate: new Date("2026-12-31T00:00:00.000Z"),
      exclusions: [],
    } as any);

    const req = makeReq({ endDate: "2026-12-31T00:00:00.000Z" });
    const res = makeRes();

    await editHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockLog).toHaveBeenCalledWith(
      expect.objectContaining({
        targetTaskId: 1,
        short_description:
          "Changed task end date of Feed with Fido to 12/31/2026",
        long_description:
          "The end date of Feed with Fido changed from indefinite to 12/31/2026.",
      }),
    );
  });

  it("does not log CHANGED_TASK_END_DATE when endDate is omitted entirely", async () => {
    mockTaskServiceProto.getRecurrence.mockResolvedValue({
      days: [],
      cadence: Cadence.WEEKLY,
      endDate: new Date("2026-06-01T00:00:00.000Z"),
      exclusions: [],
    } as any);
    mockTaskServiceProto.updateRecurrence.mockResolvedValue({
      days: [],
      cadence: Cadence.WEEKLY,
      endDate: new Date("2026-06-01T00:00:00.000Z"),
      exclusions: [],
    } as any);

    const req = makeReq({ notes: "updated notes" });
    const res = makeRes();

    await editHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockLog).not.toHaveBeenCalledWith(
      expect.objectContaining({
        short_description: expect.stringContaining("end date"),
      }),
    );
  });
});
