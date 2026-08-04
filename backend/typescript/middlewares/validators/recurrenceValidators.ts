import { Request, Response, NextFunction } from "express";
import {
  getApiValidationError,
  validateDate,
  validatePrimitive,
  validateEnum,
  validateEnumArray,
} from "./util";
import { Days, Cadence } from "../../types";

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export const createRecurringTaskValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { body } = req;

  // Validate task fields
  if (!body.task) {
    return res.status(400).send("The task field is required");
  }

  if (
    body.task.userId !== undefined &&
    body.task.userId !== null &&
    !validatePrimitive(body.task.userId, "integer")
  ) {
    return res
      .status(400)
      .send(getApiValidationError("task.userId", "integer"));
  }

  if (!validatePrimitive(body.task.petId, "integer")) {
    return res.status(400).send(getApiValidationError("task.petId", "integer"));
  }

  if (!validatePrimitive(body.task.taskTemplateId, "integer")) {
    return res
      .status(400)
      .send(getApiValidationError("task.taskTemplateId", "integer"));
  }

  if (
    body.task.scheduledStartTime !== undefined &&
    body.task.scheduledStartTime !== null &&
    !validateDate(body.task.scheduledStartTime)
  ) {
    return res
      .status(400)
      .send(getApiValidationError("task.scheduledStartTime", "Date"));
  }

  if (
    body.task.startTime !== undefined &&
    body.task.startTime !== null &&
    !validateDate(body.task.startTime)
  ) {
    return res
      .status(400)
      .send(getApiValidationError("task.startTime", "Date"));
  }

  if (
    body.task.endTime !== undefined &&
    body.task.endTime !== null &&
    !validateDate(body.task.endTime)
  ) {
    return res.status(400).send(getApiValidationError("task.endTime", "Date"));
  }

  if (
    body.task.notes !== undefined &&
    body.task.notes !== null &&
    !validatePrimitive(body.task.notes, "string")
  ) {
    return res.status(400).send(getApiValidationError("task.notes", "string"));
  }

  // Validate recurrence fields
  if (!body.recurrence) {
    return res.status(400).send("The recurrence field is required");
  }

  if (!validateEnum(body.recurrence.cadence, Cadence)) {
    return res
      .status(400)
      .send(
        `The recurrence.cadence must be one of: ${Object.values(Cadence).join(
          ", ",
        )}`,
      );
  }

  if (
    body.recurrence.days !== undefined &&
    body.recurrence.days !== null &&
    !validateEnumArray(body.recurrence.days, Days)
  ) {
    return res
      .status(400)
      .send(
        `The recurrence.days must be an array of: ${Object.values(Days).join(
          ", ",
        )}`,
      );
  }

  if (
    body.recurrence.endDate !== undefined &&
    body.recurrence.endDate !== null &&
    !validateDate(body.recurrence.endDate)
  ) {
    return res
      .status(400)
      .send(getApiValidationError("recurrence.endDate", "Date"));
  }

  if (
    body.recurrence.exclusions !== undefined &&
    body.recurrence.exclusions !== null
  ) {
    if (!Array.isArray(body.recurrence.exclusions)) {
      return res
        .status(400)
        .send("The recurrence.exclusions must be an array of dates");
    }
    if (
      !body.recurrence.exclusions.every((exclusion: string) =>
        validateDate(exclusion),
      )
    ) {
      return res
        .status(400)
        .send("Each item in recurrence.exclusions must be a valid date");
    }
  }

  return next();
};

export const addRecurrenceToTaskValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { body } = req;

  // Validate optional task fields
  if (body.task !== undefined && body.task !== null) {
    if (
      body.task.userId !== undefined &&
      body.task.userId !== null &&
      !validatePrimitive(body.task.userId, "integer")
    ) {
      return res
        .status(400)
        .send(getApiValidationError("task.userId", "integer"));
    }

    if (
      body.task.petId !== undefined &&
      body.task.petId !== null &&
      !validatePrimitive(body.task.petId, "integer")
    ) {
      return res
        .status(400)
        .send(getApiValidationError("task.petId", "integer"));
    }

    if (
      body.task.taskTemplateId !== undefined &&
      body.task.taskTemplateId !== null &&
      !validatePrimitive(body.task.taskTemplateId, "integer")
    ) {
      return res
        .status(400)
        .send(getApiValidationError("task.taskTemplateId", "integer"));
    }

    if (
      body.task.scheduledStartTime !== undefined &&
      body.task.scheduledStartTime !== null &&
      !validateDate(body.task.scheduledStartTime)
    ) {
      return res
        .status(400)
        .send(getApiValidationError("task.scheduledStartTime", "Date"));
    }

    if (
      body.task.startTime !== undefined &&
      body.task.startTime !== null &&
      !validateDate(body.task.startTime)
    ) {
      return res
        .status(400)
        .send(getApiValidationError("task.startTime", "Date"));
    }

    if (
      body.task.endTime !== undefined &&
      body.task.endTime !== null &&
      !validateDate(body.task.endTime)
    ) {
      return res
        .status(400)
        .send(getApiValidationError("task.endTime", "Date"));
    }

    if (
      body.task.notes !== undefined &&
      body.task.notes !== null &&
      !validatePrimitive(body.task.notes, "string")
    ) {
      return res
        .status(400)
        .send(getApiValidationError("task.notes", "string"));
    }
  }

  // Validate recurrence fields
  if (!body.recurrence) {
    return res.status(400).send("The recurrence field is required");
  }

  if (!validateEnum(body.recurrence.cadence, Cadence)) {
    return res
      .status(400)
      .send(
        `The recurrence.cadence must be one of: ${Object.values(Cadence).join(
          ", ",
        )}`,
      );
  }

  if (
    body.recurrence.days !== undefined &&
    body.recurrence.days !== null &&
    !validateEnumArray(body.recurrence.days, Days)
  ) {
    return res
      .status(400)
      .send(
        `The recurrence.days must be an array of: ${Object.values(Days).join(
          ", ",
        )}`,
      );
  }

  if (
    body.recurrence.endDate !== undefined &&
    body.recurrence.endDate !== null &&
    !validateDate(body.recurrence.endDate)
  ) {
    return res
      .status(400)
      .send(getApiValidationError("recurrence.endDate", "Date"));
  }

  if (
    body.recurrence.exclusions !== undefined &&
    body.recurrence.exclusions !== null
  ) {
    if (!Array.isArray(body.recurrence.exclusions)) {
      return res
        .status(400)
        .send("The recurrence.exclusions must be an array of dates");
    }
    if (
      !body.recurrence.exclusions.every((exclusion: string) =>
        validateDate(exclusion),
      )
    ) {
      return res
        .status(400)
        .send("Each item in recurrence.exclusions must be a valid date");
    }
  }

  return next();
};
