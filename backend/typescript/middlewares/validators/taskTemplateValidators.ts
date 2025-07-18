import { Request, Response, NextFunction } from "express";
import { getApiValidationError, validateEnum, validatePrimitive } from "./util";
import { TaskCategory } from "../../types";

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
  if (!validateEnum(body.category, TaskCategory)) {
    return res
      .status(400)
      .send(getApiValidationError("category", "TaskCategory"));
  }
  if (
    body.instructions !== undefined &&
    body.instructions !== null &&
    !validatePrimitive(body.instructions, "string")
  ) {
    return res
      .status(400)
      .send(getApiValidationError("instructions", "string"));
  }

  return next();
};
