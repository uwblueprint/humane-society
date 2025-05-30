import { Request, Response, NextFunction } from "express";
import {
  getApiValidationError,
  getConstraintError,
  validatePrimitive,
  validateEnumArray,
  validateNumberConstraint,
} from "./util";
import { AnimalTag } from "../../types";

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
  if (!validatePrimitive(req.body.role, "string")) {
    return res.status(400).send(getApiValidationError("role", "string"));
  }
  if (!validatePrimitive(req.body.colorLevel, "integer")) {
    return res.status(400).send(getApiValidationError("colorLevel", "integer"));
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
    req.body.phoneNumber !== undefined &&
    req.body.phoneNumber !== null &&
    !validatePrimitive(req.body.phoneNumber, "string")
  ) {
    return res.status(400).send(getApiValidationError("phoneNumber", "string"));
  }

  return next();
};

export const updateUserDtoValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (
    req.body.firstName !== undefined &&
    req.body.firstName !== null &&
    !validatePrimitive(req.body.firstName, "string")
  ) {
    return res.status(400).send(getApiValidationError("firstName", "string"));
  }
  if (
    req.body.lastName !== undefined &&
    req.body.lastName !== null &&
    !validatePrimitive(req.body.lastName, "string")
  ) {
    return res.status(400).send(getApiValidationError("lastName", "string"));
  }
  if (
    req.body.email !== undefined &&
    req.body.email !== null &&
    !validatePrimitive(req.body.email, "string")
  ) {
    return res.status(400).send(getApiValidationError("email", "string"));
  }
  if (
    req.body.role !== undefined &&
    req.body.role !== null &&
    !validatePrimitive(req.body.role, "string")
  ) {
    return res.status(400).send(getApiValidationError("role", "string"));
  }
  if (
    req.body.colorLevel !== undefined &&
    req.body.colorLevel !== null &&
    !validatePrimitive(req.body.colorLevel, "integer")
  ) {
    return res.status(400).send(getApiValidationError("colorLevel", "integer"));
  }
  if (!validateNumberConstraint(req.body.colorLevel, 1, 5)) {
    return res.status(400).send(getConstraintError("colorLevel", 1, 5));
  }
  if (
    req.body.animalTags !== undefined &&
    req.body.animalTags !== null &&
    !validateEnumArray(req.body.animalTags, AnimalTag)
  ) {
    return res
      .status(400)
      .send(getApiValidationError("animalTags", "AnimalTag", true));
  }
  if (
    req.body.profilePhoto !== undefined &&
    req.body.profilePhoto !== null &&
    !validatePrimitive(req.body.profilePhoto, "string")
  ) {
    return res
      .status(400)
      .send(getApiValidationError("profilePhoto", "string"));
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
    req.body.phoneNumber !== undefined &&
    req.body.phoneNumber !== null &&
    !validatePrimitive(req.body.phoneNumber, "string")
  ) {
    return res.status(400).send(getApiValidationError("phoneNumber", "string"));
  }
  return next();
};
