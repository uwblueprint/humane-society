import { Request, Response, NextFunction } from "express";
import { getApiValidationError, validateDate, validatePrimitive, } from "./util";

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable-next-line import/prefer-default-export */
export const activityRequestDtoValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { body } = req;
  console.log(body)

  if (body.userId !== undefined &&
    body.userId !== null &&
    !validatePrimitive(body.userId, "integer")) {
    return res.status(400).send(getApiValidationError("userId", "integer"));
  }

  if (!validatePrimitive(body.petId, "integer")) {
    return res.status(400).send(getApiValidationError("petId", "integer"));
  }

  if (!validatePrimitive(body.activityTypeId, "integer")) {
    return res.status(400).send(getApiValidationError("activityTypeId", "integer"));
  }

  if (body.scheduledStartTime !== undefined &&
    body.scheduledStartTime !== null &&
    !validateDate(body.scheduledStartTime)) {
    return res.status(400).send(getApiValidationError("scheduledStartTime", "Date"));
  }

  if (body.startTime !== undefined &&
    body.startTime !== null &&
    !validateDate(body.startTime)) {
    return res.status(400).send(getApiValidationError("startTime", "Date"));
  }

  if (body.endTime !== undefined &&
    body.endTime !== null &&
    !validateDate(body.endTime)) {
    return res.status(400).send(getApiValidationError("endTime", "Date"));
  }

  if (body.notes !== undefined &&
    body.notes !== null &&
    !validatePrimitive(body.notes, "string")) {
    return res.status(400).send(getApiValidationError("notes", "string"));
  }

  return next();
};
