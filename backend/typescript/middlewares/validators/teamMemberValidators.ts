// validate paramters passed to the POST endpoint
import { Request, Response, NextFunction } from "express";
import { getApiValidationError, validatePrimitive } from "./util";

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable-next-line import/prefer-default-export */
// does it exist and is it a string? return 400 bad request 
export const createTeamMemberDtoValidator = async (
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
  if (!validatePrimitive(req.body.teamRole, "string")) {
    return res.status(400).send(getApiValidationError("teamRole", "string"));
  }
  return next();
};