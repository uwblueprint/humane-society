import { NextFunction, Request, Response } from "express";

import AuthService from "../services/implementations/authService";
import UserService from "../services/implementations/userService";
import IAuthService from "../services/interfaces/authService";
import { Role } from "../types";

const authService: IAuthService = new AuthService(new UserService());

export const getAccessToken = (req: Request): string | null => {
  const authHeaderParts = req.headers.authorization?.split(" ");
  if (
    authHeaderParts &&
    authHeaderParts.length >= 2 &&
    authHeaderParts[0].toLowerCase() === "bearer"
  ) {
    return authHeaderParts[1];
  }
  return null;
};

/* Determine if request is authorized based on accessToken validity and role of client */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export const isAuthorizedByRole = (roles: Set<Role>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = getAccessToken(req);
    const authorized =
      accessToken && (await authService.isAuthorizedByRole(accessToken, roles));
    if (!authorized) {
      return res
        .status(401)
        .json({ error: "You are not authorized to make this request." });
    }
    return next();
  };
};

/* Determine if request for a user-specific resource is authorized based on accessToken
 * validity and if the userId that the token was issued to matches the requested userId
 * Note: userIdField is the name of the request parameter containing the requested userId */
export const isAuthorizedByUserId = (userIdField: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = getAccessToken(req);
    const authorized =
      accessToken &&
      (await authService.isAuthorizedByUserId(
        accessToken,
        req.params[userIdField],
      ));
    if (!authorized) {
      return res
        .status(401)
        .json({ error: "You are not authorized to make this request." });
    }
    return next();
  };
};

/* Determine if a request to assign a user to a task is authorized.
 * Administrators and Animal Behaviourists may assign the task to any user.
 * Any other authenticated user (e.g. a Volunteer) may only assign themselves,
 * i.e. the assignee id in the request body must match their own user id.
 * Note: assigneeIdField is the name of the request body field containing the
 * id of the user the task is being assigned to. */
export const isAuthorizedToAssignTask = (assigneeIdField: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = getAccessToken(req);
    if (!accessToken) {
      return res
        .status(401)
        .json({ error: "You are not authorized to make this request." });
    }

    // Privileged roles can assign the task to anyone.
    const canAssignAnyone = await authService.isAuthorizedByRole(
      accessToken,
      new Set([Role.ADMINISTRATOR, Role.ANIMAL_BEHAVIOURIST]),
    );
    if (canAssignAnyone) {
      return next();
    }

    // Otherwise the caller may only assign the task to themselves.
    const isSelfAssign = await authService.isAuthorizedByUserId(
      accessToken,
      String(req.body[assigneeIdField]),
    );
    if (isSelfAssign) {
      return next();
    }

    return res.status(403).json({
      error: "You are not authorized to assign this task to another user.",
    });
  };
};

/* Determine if request for a user-specific resource is authorized based on accessToken
 * validity and if the email that the token was issued to matches the requested email
 * Note: emailField is the name of the request parameter containing the requested email */
export const isAuthorizedByEmail = (emailField: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = getAccessToken(req);
    const authorized =
      accessToken &&
      (await authService.isAuthorizedByEmail(
        accessToken,
        req.params[emailField],
      ));
    if (!authorized) {
      return res
        .status(401)
        .json({ error: "You are not authorized to make this request." });
    }
    return next();
  };
};
