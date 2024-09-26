import { Router } from "express";

import { isAuthorizedByRole } from "../middlewares/auth";
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
import { Role, UserDTO, UserStatus } from "../types";
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
        res.status(500).json({ error: getErrorMessage(error) });
      }
    }
  }
});

/* Create a user */
userRouter.post("/", createUserDtoValidator, async (req, res) => {
  try {
    const newUser = await userService.createUser({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      role: req.body.role ?? Role.VOLUNTEER,
      status: req.body.status ?? UserStatus.ACTIVE, // TODO: make this default to inactive once user registration flow is done
      skillLevel: req.body.skillLevel ?? null,
      canSeeAllLogs: req.body.canSeeAllLogs ?? null,
      canAssignUsersToTasks: req.body.canSeeAllUsers ?? null,
      phoneNumber: req.body.phoneNumber ?? null,
      password: req.body.password,
    });

    // await authService.sendEmailVerificationLink(req.body.email); // TODO: Uncomment once email service is ready

    res.status(201).json(newUser);
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
});

/* Update the user with the specified userId */
userRouter.put("/:userId", updateUserDtoValidator, async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (Number.isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID" });
    }

    const updatedUser = await userService.updateUserById(userId, {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      role: req.body.role,
      status: req.body.status,
      skillLevel: req.body.skillLevel ?? null,
      canSeeAllLogs: req.body.canSeeAllLogs ?? null,
      canAssignUsersToTasks: req.body.canSeeAllUsers ?? null,
      phoneNumber: req.body.phoneNumber ?? null,
    });
    res.status(200).json(updatedUser);
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
});

/* Delete a user by userId or email, specified through a query parameter */
userRouter.delete("/", async (req, res) => {
  const { userId, email } = req.query;

  if (userId && email) {
    res.status(400).json({ error: "Cannot delete by both userId and email." });
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
        await userService.deleteUserById(Number(userId));
        res.status(204).send();
      } catch (error: unknown) {
        res.status(500).json({ error: getErrorMessage(error) });
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
