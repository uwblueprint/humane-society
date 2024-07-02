import { Request, Response, NextFunction } from "express";
import { getApiValidationError, validatePrimitive } from "./util";

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export const createUserDtoValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!validatePrimitive(req.body.firstName, "string")) {
    return res.status(400).send(getApiValidationError("firstName", "string"));
  }
  if (!validatePrimitive(req.body.lastName, "string")) {
    return res.status(400).send(getApiValidationError("lastName", "string"));
  }
  if (!validatePrimitive(req.body.email, "string")) {
    return res.status(400).send(getApiValidationError("email", "string"));
  }
  if (!validatePrimitive(req.body.roleId, "integer")) {
    return res.status(400).send(getApiValidationError("roleId", "integer"));
  }
  if (!validatePrimitive(req.body.password, "string")) {
    return res.status(400).send(getApiValidationError("password", "string"));
  }
  if (
    req.body.skillLevel !== undefined &&
    req.body.skillLevel !== null &&
    !validatePrimitive(req.body.skillLevel, "integer")
  ) {
    return res.status(400).send(getApiValidationError("skillLevel", "integer"));
  }
  if (
    req.body.canSeeAllLogs !== undefined &&
    req.body.canSeeAllLogs !== null &&
    !validatePrimitive(req.body.canSeeAllLogs, "boolean")
  ) {
    return res
      .status(400)
      .send(getApiValidationError("canSeeAllLogs", "boolean"));
  }
  if (
    req.body.canAssignUsersToTasks !== undefined &&
    req.body.canAssignUsersToTasks !== null &&
    !validatePrimitive(req.body.canAssignUsersToTasks, "boolean")
  ) {
    return res
      .status(400)
      .send(getApiValidationError("canAssignUsersToTasks", "boolean"));
  }
  if (
    req.body.phoneinteger !== undefined &&
    req.body.phoneinteger !== null &&
    !validatePrimitive(req.body.phoneinteger, "string")
  ) {
    return res
      .status(400)
      .send(getApiValidationError("phoneinteger", "string"));
  }

  return next();
};

export const updateUserDtoValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!validatePrimitive(req.body.firstName, "string")) {
    return res.status(400).send(getApiValidationError("firstName", "string"));
  }
  if (!validatePrimitive(req.body.lastName, "string")) {
    return res.status(400).send(getApiValidationError("lastName", "string"));
  }
  if (!validatePrimitive(req.body.email, "string")) {
    return res.status(400).send(getApiValidationError("email", "string"));
  }
  if (!validatePrimitive(req.body.roleId, "integer")) {
    return res.status(400).send(getApiValidationError("roleId", "integer"));
  }
  if (
    req.body.skillLevel !== undefined &&
    req.body.skillLevel !== null &&
    !validatePrimitive(req.body.skillLevel, "integer")
  ) {
    return res.status(400).send(getApiValidationError("skillLevel", "integer"));
  }
  if (
    req.body.canSeeAllLogs !== undefined &&
    req.body.canSeeAllLogs !== null &&
    !validatePrimitive(req.body.canSeeAllLogs, "boolean")
  ) {
    return res
      .status(400)
      .send(getApiValidationError("canSeeAllLogs", "boolean"));
  }
  if (
    req.body.canAssignUsersToTasks !== undefined &&
    req.body.canAssignUsersToTasks !== null &&
    !validatePrimitive(req.body.canAssignUsersToTasks, "boolean")
  ) {
    return res
      .status(400)
      .send(getApiValidationError("canAssignUsersToTasks", "boolean"));
  }
  if (
    req.body.phoneinteger !== undefined &&
    req.body.phoneinteger !== null &&
    !validatePrimitive(req.body.phoneinteger, "string")
  ) {
    return res
      .status(400)
      .send(getApiValidationError("phoneinteger", "string"));
  }
  return next();
};
