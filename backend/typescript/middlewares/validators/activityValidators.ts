import { Request, Response, NextFunction } from "express";
import { getApiValidationError, validateDate, validatePrimitive,} from "./util";

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable-next-line import/prefer-default-export */
export const activityRequestDtoValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { body } = req;

  if (!validatePrimitive(body.activityId, "integer")) {
    return res.status(400).send(getApiValidationError("activityId", "integer"));
  }

  if (!validatePrimitive(body.userId, "integer")) {
    return res.status(400).send(getApiValidationError("userId", "integer"));
  }

  if (!validatePrimitive(body.petId, "integer")) {
    return res.status(400).send(getApiValidationError("petId", "integer"));
  }

  if (!validatePrimitive(body.activityTypeId, "integer")) {
    return res.status(400).send(getApiValidationError("activityTypeId", "integer"));
  }

  if (!validateDate(body.scheduledStartTime)) {
    return res.status(400).send(getApiValidationError("scheduledStartTime", "integer"));
  }

  if (!validateDate(body.startTime)) {
    return res.status(400).send(getApiValidationError("startTime", "integer"));
  }

  if (!validateDate(body.endTime)) {
    return res.status(400).send(getApiValidationError("endTime", "integer"));
  }

  if (!validatePrimitive(body.notes, "string")) {
    return res.status(400).send(getApiValidationError("notes", "string"));
  }

  return next();
};
