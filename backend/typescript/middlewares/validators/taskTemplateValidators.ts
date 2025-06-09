import { Request, Response, NextFunction } from "express";
import { getApiValidationError, validatePrimitive } from "./util";

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable-next-line import/prefer-default-export */
export const taskTemplateRequestDtoValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { body } = req;
  if (!validatePrimitive(body.taskName, "string")) {
    return res.status(400).send(getApiValidationError("taskName", "string"));
  }

  return next();
};
