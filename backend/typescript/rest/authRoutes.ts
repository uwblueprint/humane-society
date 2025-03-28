import { CookieOptions, Router } from "express";

import {
  isAuthorizedByEmail,
  isAuthorizedByUserId,
  isAuthorizedByRole,
} from "../middlewares/auth";
import {
  loginRequestValidator,
  loginWithSignInLinkRequestValidator,
  inviteUserDtoValidator,
  updateOwnUserDtoValidator,
} from "../middlewares/validators/authValidators";
import nodemailerConfig from "../nodemailer.config";
import AuthService from "../services/implementations/authService";
import EmailService from "../services/implementations/emailService";
import UserService from "../services/implementations/userService";
import IAuthService from "../services/interfaces/authService";
import IEmailService from "../services/interfaces/emailService";
import IUserService from "../services/interfaces/userService";
import { getErrorMessage, NotFoundError } from "../utilities/errorUtils";
import { UserStatus, Role, UserDTO } from "../types";

const authRouter: Router = Router();
const userService: IUserService = new UserService();
const emailService: IEmailService = new EmailService(nodemailerConfig);
const authService: IAuthService = new AuthService(userService, emailService);

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: process.env.PREVIEW_DEPLOY ? "none" : "strict",
  secure: process.env.NODE_ENV === "production",
};

/* Returns access token and user info in response body and sets refreshToken as an httpOnly cookie */
authRouter.post("/login", loginRequestValidator, async (req, res) => {
  try {
    const authDTO = req.body.idToken
      ? // OAuth
        await authService.generateTokenOAuth(req.body.idToken)
      : await authService.generateToken(req.body.email, req.body.password);

    const { refreshToken, ...rest } = authDTO;

    res
      .cookie("refreshToken", refreshToken, cookieOptions)
      .status(200)
      .json(rest);
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
});

/* Returns access token and user info in response body and sets refreshToken as an httpOnly cookie */
authRouter.post(
  "/loginWithSignInLink",
  loginWithSignInLinkRequestValidator,
  async (req, res) => {
    try {
      if (isAuthorizedByEmail(req.body.email)) {
        const user = await userService.getUserByEmail(req.body.email);

        const activatedUser = user;
        activatedUser.status = UserStatus.ACTIVE;
        await userService.updateUserById(user.id, activatedUser);

        const rest = {
          ...{ accessToken: req.body.accessToken },
          ...activatedUser,
        };
        res
          .cookie("refreshToken", req.body.refreshToken, cookieOptions)
          .status(200)
          .json(rest);
      }
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        res.status(404).send(getErrorMessage(error));
      } else {
        res.status(500).json({ error: getErrorMessage(error) });
      }
    }
  },
);

/* Returns access token in response body and sets refreshToken as an httpOnly cookie */
authRouter.post("/refresh", async (req, res) => {
  try {
    const token = await authService.renewToken(req.cookies.refreshToken);

    res
      .cookie("refreshToken", token.refreshToken, cookieOptions)
      .status(200)
      .json({ accessToken: token.accessToken });
  } catch (error: unknown) {
    res.status(500).json({ error: getErrorMessage(error) });
  }
});

/* Revokes all of the specified user's refresh tokens */
authRouter.post(
  "/logout/:userId",
  isAuthorizedByUserId("userId"),
  async (req, res) => {
    try {
      await authService.revokeTokens(req.params.userId);
      res.status(204).send();
    } catch (error: unknown) {
      res.status(500).json({ error: getErrorMessage(error) });
    }
  },
);

/* Emails a password reset link to the user with the specified email */
authRouter.post(
  "/resetPassword/:email",
  isAuthorizedByEmail("email"),
  async (req, res) => {
    try {
      await authService.resetPassword(req.params.email);
      res.status(204).send();
    } catch (error: unknown) {
      res.status(500).json({ error: getErrorMessage(error) });
    }
  },
);

// updates user password and updates status
authRouter.post(
  "/setPassword/:email",
  isAuthorizedByEmail("email"),
  async (req, res) => {
    try {
      const responseSuccess = await authService.setPassword(
        req.params.email,
        req.body.newPassword,
      );
      if (responseSuccess.success) {
        const user = await userService.getUserByEmail(req.params.email);
        if (user.status === UserStatus.INVITED) {
          userService.updateUserById(user.id, {
            ...user,
            status: UserStatus.ACTIVE,
          });
        }
        res.status(200).json(responseSuccess);
      } else {
        res.status(400).json(responseSuccess);
      }
    } catch (error) {
      res.status(500).json({ error: getErrorMessage(error) });
    }
  },
);

/* Get own user info */
authRouter.get("/:userId", isAuthorizedByUserId("userId"), async (req, res) => {
  const { userId } = req.params;
  if (userId) {
    try {
      const user = await userService.getUserById(userId);
      res.status(200).json(user);
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        res.status(404).send(getErrorMessage(error));
      } else {
        res.status(500).json({ error: getErrorMessage(error) });
      }
    }
  }
});

/* Update own user fields: firstName, lastName, phoneNumber */
authRouter.put("/:userId", updateOwnUserDtoValidator, async (req, res) => {
  const { userId } = req.params;
  if (!isAuthorizedByEmail(userId)) {
    res.status(401).json({ error: "User is not authorized to update fields." });
    return;
  }

  try {
    const user: UserDTO = await userService.getUserById(userId);
    const updatedUser = await userService.updateUserById(Number(userId), {
      firstName: req.body.firstName ?? user.firstName,
      lastName: req.body.lastName ?? user.lastName,
      email: user.email,
      role: user.role,
      status: user.status,
      skillLevel: user.skillLevel,
      canSeeAllLogs: user.canSeeAllLogs,
      canAssignUsersToTasks: user.canAssignUsersToTasks,
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

/* Invite a user */
authRouter.post("/invite-user", inviteUserDtoValidator, async (req, res) => {
  try {
    if (
      !isAuthorizedByRole(
        new Set([Role.ADMINISTRATOR, Role.ANIMAL_BEHAVIOURIST]),
      )
    ) {
      res
        .status(401)
        .json({ error: "User is not authorized to invite user. " });
      return;
    }

    const user = await userService.getUserByEmail(req.body.email);
    if (user.status === UserStatus.ACTIVE) {
      res.status(400).json({ error: "User has already claimed account." });
      return;
    }

    await authService.sendInviteEmail(
      `${user.firstName} ${user.lastName}`,
      req.body.email,
      String(user.role),
    );
    if (user.status === UserStatus.INVITED) {
      res
        .status(204)
        .send("Success. Previous invitation has been invalidated.");
      return;
    }
    const invitedUser = user;
    invitedUser.status = UserStatus.INVITED;
    await userService.updateUserById(user.id, invitedUser);

    res.status(204).send();
  } catch (error: unknown) {
    if (error instanceof NotFoundError) {
      res.status(404).send(getErrorMessage(error));
    } else {
      res.status(500).json({ error: getErrorMessage(error) });
    }
  }
});

export default authRouter;
