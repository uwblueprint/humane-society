import { Router } from "express";

import { getAccessToken, isAuthorizedByRole } from "../middlewares/auth";
import {
  createUserDtoValidator,
  updateUserDtoValidator,
} from "../middlewares/validators/userValidators";
import nodemailerConfig from "../nodemailer.config";
import AuthService from "../services/implementations/authService";
import EmailService from "../services/implementations/emailService";
import UserService from "../services/implementations/userService";
import IAuthService from "../services/interfaces/authService";
import IEmailService from "../services/interfaces/emailService";
import IUserService from "../services/interfaces/userService";
import { Role, UserDTO } from "../types";
import {
  getErrorMessage,
  NotFoundError,
  INTERNAL_SERVER_ERROR_MESSAGE,
} from "../utilities/errorUtils";
import { sendResponseByMimeType } from "../utilities/responseUtil";

const userRouter: Router = Router();
userRouter.use(
  isAuthorizedByRole(new Set([Role.ADMINISTRATOR, Role.ANIMAL_BEHAVIOURIST])),
);

const userService: IUserService = new UserService();
const emailService: IEmailService = new EmailService(nodemailerConfig);
const authService: IAuthService = new AuthService(userService, emailService);

/* Get all users, optionally filter by a userId or email query parameter to retrieve a single user */
userRouter.get("/", async (req, res) => {
  const { userId, email } = req.query;
  const contentType = req.headers["content-type"];

  if (userId && email) {
    await sendResponseByMimeType(res, 400, contentType, [
      {
        error: "Cannot query by both userId and email.",
      },
    ]);
    return;
  }

  if (!userId && !email) {
    try {
      const users = await userService.getUsers();
      await sendResponseByMimeType<UserDTO>(res, 200, contentType, users);
    } catch (error: unknown) {
      await sendResponseByMimeType(res, 500, contentType, [
        {
          error: getErrorMessage(error),
        },
      ]);
    }
    return;
  }

  if (userId) {
    if (typeof userId !== "string") {
      res
        .status(400)
        .json({ error: "userId query parameter must be a string." });
    } else if (Number.isNaN(Number(userId))) {
      res.status(400).json({ error: "Invalid user ID" });
    } else {
      try {
        const user = await userService.getUserById(userId);
        res.status(200).json(user);
      } catch (error: unknown) {
        if (error instanceof NotFoundError) {
          res.status(404).send(getErrorMessage(error));
        } else {
          res.status(500).send(INTERNAL_SERVER_ERROR_MESSAGE);
        }
      }
    }
    return;
  }

  if (email) {
    if (typeof email !== "string") {
      res
        .status(400)
        .json({ error: "email query parameter must be a string." });
    } else {
      try {
        const user = await userService.getUserByEmail(email);
        res.status(200).json(user);
      } catch (error: unknown) {
        if (error instanceof NotFoundError) {
          res.status(404).send(getErrorMessage(error));
        } else {
          res.status(500).json({ error: getErrorMessage(error) });
        }
      }
    }
  }
});

// This endpoint is for testing purposes
/* Create a user */
userRouter.post("/", createUserDtoValidator, async (req, res) => {
  try {
    const newUser = await userService.createUser({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      role: req.body.role,
      skillLevel: req.body.skillLevel ?? null,
      canSeeAllLogs: req.body.canSeeAllLogs ?? null,
      canAssignUsersToTasks: req.body.canSeeAllUsers ?? null,
      phoneNumber: req.body.phoneNumber ?? null,
    });

    // await authService.sendEmailVerificationLink(req.body.email);

    res.status(201).json(newUser);
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
});

/* Update the user with the specified userId */
userRouter.put("/:userId", updateUserDtoValidator, async (req, res) => {
  const userId = Number(req.params.userId);
  if (Number.isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  const accessToken = getAccessToken(req);
  if (!accessToken) {
    res.status(404).json({ error: "Access token not found" });
    return;
  }

  try {
    const isBehaviourist = await authService.isAuthorizedByRole(
      accessToken,
      new Set([Role.ANIMAL_BEHAVIOURIST]),
    );
    const behaviouristUpdatableSet = new Set(["skillLevel"]);
    if (isBehaviourist) {
      const deniedFieldSet = Object.keys(req.body).filter((field) => {
        return !behaviouristUpdatableSet.has(field);
      });
      if (deniedFieldSet.length > 0) {
        const deniedFieldsString = "Not authorized to update field(s): ".concat(
          deniedFieldSet.join(", "),
        );
        res.status(403).json({ error: deniedFieldsString });
        return;
      }
    }
  } catch (error: unknown) {
    if (error instanceof NotFoundError) {
      res.status(400).json({ error: getErrorMessage(error) });
    } else {
      res.status(500).json({ error: getErrorMessage(error) });
    }
  }

  try {
    const user: UserDTO = await userService.getUserById(String(userId));
    const updatedUser = await userService.updateUserById(userId, {
      firstName: req.body.firstName ?? user.firstName,
      lastName: req.body.lastName ?? user.lastName,
      email: req.body.email ?? user.email,
      role: req.body.role ?? user.role,
      status: req.body.status ?? user.status,
      skillLevel: req.body.skillLevel ?? user.skillLevel,
      canSeeAllLogs: req.body.canSeeAllLogs ?? user.canSeeAllLogs,
      canAssignUsersToTasks:
        req.body.canAssignUsersToTasks ?? user.canAssignUsersToTasks,
      phoneNumber: req.body.phoneNumber ?? user.phoneNumber,
    });
    res.status(200).json(updatedUser);
  } catch (error: unknown) {
    if (error instanceof NotFoundError) {
      res.status(400).json({ error: getErrorMessage(error) });
    } else {
      res.status(500).json({ error: getErrorMessage(error) });
    }
  }
});

/* Delete a user by userId or email, specified through a query parameter */
userRouter.delete("/", async (req, res) => {
  const { userId, email } = req.query;

  if (userId && email) {
    res.status(400).json({ error: "Cannot delete by both userId and email." });
    return;
  }

  const accessToken = getAccessToken(req);
  if (!accessToken) {
    res.status(404).json({ error: "Access token not found" });
    return;
  }

  const isAdministrator = await authService.isAuthorizedByRole(
    accessToken,
    new Set([Role.ADMINISTRATOR]),
  );
  if (!isAdministrator) {
    res.status(403).json({ error: "Not authorized to delete user" });
    return;
  }

  if (userId) {
    if (typeof userId !== "string") {
      res
        .status(400)
        .json({ error: "userId query parameter must be a string." });
    } else if (Number.isNaN(Number(userId))) {
      res.status(400).json({ error: "Invalid user ID" });
    } else {
      try {
        const user: UserDTO = await userService.getUserById(userId);
        if (user.status === "Active") {
          res.status(400).json({
            error:
              "user status must be 'Inactive' or 'Invited' before deletion.",
          });
          return;
        }
        await userService.deleteUserById(Number(userId));
        res.status(204).send();
      } catch (error: unknown) {
        if (error instanceof NotFoundError) {
          res.status(400).json({ error: getErrorMessage(error) });
        } else {
          res.status(500).json({ error: getErrorMessage(error) });
        }
      }
    }
    return;
  }

  if (email) {
    if (typeof email !== "string") {
      res
        .status(400)
        .json({ error: "email query parameter must be a string." });
    } else {
      try {
        const user: UserDTO = await userService.getUserByEmail(email);
        if (user.status === "Active") {
          res.status(400).json({
            error: "user status must be 'Inactive' or 'Invited' for deletion.",
          });
          return;
        }
        await userService.deleteUserByEmail(email);
        res.status(204).send();
      } catch (error: unknown) {
        res.status(500).json({ error: getErrorMessage(error) });
      }
    }
    return;
  }

  res
    .status(400)
    .json({ error: "Must supply one of userId or email as query parameter." });
});

export default userRouter;
