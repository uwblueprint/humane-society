import { Router } from "express";

import fs from "fs";
import multer from "multer";
import { getAccessToken } from "../middlewares/auth";
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
import FileStorageService from "../services/implementations/fileStorageService";
import {
  MAX_FILE_SIZE_BYTES,
  ACCEPTED_TYPES,
  MAX_FILE_SIZE_MB,
} from "../constants";
import logInteraction from "../middlewares/logInteraction";

const upload = multer({ dest: "uploads/" });

const userRouter: Router = Router();

const userService: IUserService = new UserService();
const emailService: IEmailService = new EmailService(nodemailerConfig);
const authService: IAuthService = new AuthService(userService, emailService);
const fileStorageService: FileStorageService = new FileStorageService(
  process.env.SUPABASE_STORAGE_BUCKET || "",
);

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
      const accessToken = getAccessToken(req);
      if (!accessToken) {
        res.status(404).json({ error: "Access token not found" });
        return;
      }
      const canGetAllUsers = await authService.isAuthorizedByRole(
        accessToken,
        new Set([Role.ADMINISTRATOR, Role.ANIMAL_BEHAVIOURIST, Role.STAFF]),
      );
      if (!canGetAllUsers) {
        res.status(403).json({ error: "Not authorized to get all users" });
        return;
      }
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

/* Create a user */
userRouter.post("/", createUserDtoValidator, async (req, res) => {
  try {
    const accessToken = getAccessToken(req);
    if (!accessToken) {
      res.status(404).json({ error: "Access token not found" });
      return;
    }
    const canCreateUser = await authService.isAuthorizedByRole(
      accessToken,
      new Set([Role.ADMINISTRATOR, Role.ANIMAL_BEHAVIOURIST]),
    );
    if (!canCreateUser) {
      res.status(403).json({ error: "Not authorized to create user" });
      return;
    }

    const newUser = await userService.createUser({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      role: req.body.role,
      colorLevel: req.body.colorLevel,
      animalTags: req.body.animalTags,
      canSeeAllLogs: req.body.canSeeAllLogs ?? null,
      canAssignUsersToTasks: req.body.canAssignUsersToTasks ?? null,
      phoneNumber: req.body.phoneNumber ?? null,
    });

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

  try {
    const accessToken = getAccessToken(req);
    if (!accessToken) {
      res.status(404).json({ error: "Access token not found" });
      return;
    }
    const isAdministrator = await authService.isAuthorizedByRole(
      accessToken,
      new Set([Role.ADMINISTRATOR]),
    );
    const isBehaviourist = await authService.isAuthorizedByRole(
      accessToken,
      new Set([Role.ANIMAL_BEHAVIOURIST]),
    );
    const hasGivenUserId = await authService.isAuthorizedByUserId(
      accessToken,
      req.params.userId,
    );

    // update own user fields
    const userUpdatableSet = new Set([
      "firstName",
      "lastName",
      "phoneNumber",
      "profilePhoto",
    ]);
    if (!isAdministrator && hasGivenUserId) {
      const deniedFieldSet = Object.keys(req.body).filter((field) => {
        return !userUpdatableSet.has(field);
      });
      if (deniedFieldSet.length > 0) {
        const deniedFieldsString = "Not authorized to update field(s): ".concat(
          deniedFieldSet.join(", "),
        );
        res.status(403).json({ error: deniedFieldsString });
        return;
      }
    }

    // update other user's fields as behaviourist
    const behaviouristUpdatableSet = new Set(["colorLevel", "animalTags"]);
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

    // update other user's fields as admin
    if (isAdministrator && !hasGivenUserId && req.body.profilePhoto) {
      res.status(403).json({ error: "Not authorized to update profile photo" });
      return;
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
      email: user.email,
      role: req.body.role ?? user.role,
      status: req.body.status ?? user.status,
      colorLevel: req.body.colorLevel ?? user.colorLevel,
      animalTags: req.body.animalTags ?? user.animalTags,
      canSeeAllLogs: req.body.canSeeAllLogs ?? user.canSeeAllLogs,
      canAssignUsersToTasks:
        req.body.canAssignUsersToTasks ?? user.canAssignUsersToTasks,
      phoneNumber: req.body.phoneNumber ?? user.phoneNumber,
      profilePhoto: req.body.profilePhoto ?? user.profilePhoto,
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

userRouter.post(
  "/me/profile-photo/upload",
  upload.single("file"),
  async (req, res) => {
    const { file } = req;
    const { userId } = req.body;
    const { oldStoragePath } = req.body;

    try {
      if (!file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      if (!userId) {
        res.status(400).json({ error: "Missing userId" });
        return;
      }

      if (!ACCEPTED_TYPES.includes(file.mimetype)) {
        res.status(400).json({
          error: `Invalid file type, must be ${ACCEPTED_TYPES.join(", ")}`,
        });
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        res
          .status(400)
          .json({ error: `File size exceeds limit of ${MAX_FILE_SIZE_MB}MB` });
        return;
      }

      const storagePath = `users/${userId}/profile-photo-${Date.now()}.${
        file.mimetype.split("/")[1]
      }`;

      await fileStorageService.createFile(
        storagePath,
        file.path,
        file.mimetype,
      );

      try {
        const user = await userService.getUserById(String(userId));
        await userService.updateUserById(Number(userId), {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          status: user.status,
          colorLevel: user.colorLevel,
          animalTags: user.animalTags,
          canSeeAllLogs: user.canSeeAllLogs,
          canAssignUsersToTasks: user.canAssignUsersToTasks,
          phoneNumber: user.phoneNumber,
          profilePhoto: storagePath, // Only thing changed is profile photo path
        });
      } catch (error: unknown) {
        // If updating the DB fails, delete the uploaded file in storage
        await fileStorageService.deleteFile(storagePath);
        throw error;
      }

      if (oldStoragePath) {
        await fileStorageService.deleteFile(oldStoragePath);
      }

      res.status(200).json({
        message: "File uploaded successfully",
        storagePath,
      });
    } catch (error: unknown) {
      res.status(500).send(getErrorMessage(error));
    } finally {
      // Clean up temp file
      if (file?.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }
  },
);

userRouter.post("/me/profile-photo/default", async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    res.status(400).json({ error: "Missing userId query parameter" });
    return;
  }

  try {
    const user = await userService.getUserById(String(userId));
    if (user.profilePhoto) {
      await fileStorageService.deleteFile(user.profilePhoto);
    }
    await userService.updateUserById(Number(userId), {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status,
      colorLevel: user.colorLevel,
      animalTags: user.animalTags,
      canSeeAllLogs: user.canSeeAllLogs,
      canAssignUsersToTasks: user.canAssignUsersToTasks,
      phoneNumber: user.phoneNumber,
      profilePhoto: null, // set profile photo to null to use default
    });
    res.status(200).json({ message: "User set to default profile photo" });
  } catch (error: unknown) {
    res.status(500).send(getErrorMessage(error));
  }
});

userRouter.get("/me/profile-photo", async (req, res) => {
  const { userId } = req.query;

  try {
    if (!userId) {
      res.status(400).json({ error: "Missing userId query parameter" });
      return;
    }
    const user = await userService.getUserById(String(userId));

    if (user.profilePhoto) {
      const url = await fileStorageService.getFile(user.profilePhoto);
      res.status(200).json({ url });
    } else {
      res.status(404).json({ error: "Profile photo not found" });
    }
  } catch (error: unknown) {
    res.status(500).send(getErrorMessage(error));
  }
});

/* Change user name by id */
userRouter.patch("/:id/name", async (req, res) => {
  const idNum = Number(req.params.id);
  if (Number.isNaN(idNum)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  try {
    const updated = await userService.updateUserById(idNum, {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    });

    await logInteraction(req);
    res.status(200).json(updated);
  } catch (e) {
    res.status(500).send(getErrorMessage(e));
  }
});

/* Change user color level */
userRouter.patch("/:id/color-level", async (req, res) => {
  const idNum = Number(req.params.id);
  if (Number.isNaN(idNum)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  try {
    const updated = await userService.updateUserById(idNum, {
      colorLevel: req.body.colorLevel,
    });

    await logInteraction(req);
    res.status(200).json(updated);
  } catch (e) {
    res.status(500).send(getErrorMessage(e));
  }
});

/* Change user role by id */
userRouter.patch("/:id/role", async (req, res) => {
  const idNum = Number(req.params.id);
  if (Number.isNaN(idNum)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  try {
    const updated = await userService.updateUserById(idNum, {
      role: req.body.role,
    });

    await logInteraction(req);
    res.status(200).json(updated);
  } catch (e) {
    res.status(500).send(getErrorMessage(e));
  }
});

export default userRouter;
