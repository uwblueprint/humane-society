import { Request, Response, NextFunction } from "express";
import { getApiValidationError, validatePrimitive } from "./util";

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable-next-line import/prefer-default-export */
export const loginRequestValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.body.idToken) {
    if (!validatePrimitive(req.body.idToken, "string")) {
      return res.status(400).json(getApiValidationError("idToken", "string"));
    }
  } else {
    if (!validatePrimitive(req.body.email, "string")) {
      return res.status(400).send(getApiValidationError("email", "string"));
    }
    if (!validatePrimitive(req.body.password, "string")) {
      return res.status(400).send(getApiValidationError("password", "string"));
    }
  }
  return next();
};

export const loginWithSignInLinkRequestValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!validatePrimitive(req.body.accessToken, "string")) {
    return res.status(400).send(getApiValidationError("accessToken", "string"));
  }
  if (!validatePrimitive(req.body.refreshToken, "string")) {
    return res
      .status(400)
      .send(getApiValidationError("refreshToken", "string"));
  }
  if (!validatePrimitive(req.body.email, "string")) {
    return res.status(400).send(getApiValidationError("email", "string"));
  }

  return next();
};

export const registerRequestValidator = async (
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
  if (!validatePrimitive(req.body.password, "string")) {
    return res.status(400).send(getApiValidationError("password", "string"));
  }

  return next();
};

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export const inviteUserDtoValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!validatePrimitive(req.body.email, "string")) {
    return res.status(400).send(getApiValidationError("email", "string"));
  }
  return next();
};

export const updateOwnUserDtoValidator = async (
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
    req.body.phoneNumber !== undefined &&
    req.body.phoneNumber !== null &&
    !validatePrimitive(req.body.phoneNumber, "string")
  ) {
    return res.status(400).send(getApiValidationError("phoneNumber", "string"));
  }
  return next();
};
