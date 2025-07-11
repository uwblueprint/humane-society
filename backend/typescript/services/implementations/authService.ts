import * as firebaseAdmin from "firebase-admin";

import fs from "fs";
import IAuthService from "../interfaces/authService";
import IEmailService from "../interfaces/emailService";
import IUserService from "../interfaces/userService";
import { AuthDTO, Role, Token, ResponseSuccessDTO } from "../../types";
import { getErrorMessage } from "../../utilities/errorUtils";
import FirebaseRestClient from "../../utilities/firebaseRestClient";
import logger from "../../utilities/logger";

const Logger = logger(__filename);

class AuthService implements IAuthService {
  userService: IUserService;

  emailService: IEmailService | null;

  constructor(
    userService: IUserService,
    emailService: IEmailService | null = null,
  ) {
    this.userService = userService;
    this.emailService = emailService;
  }

  /* eslint-disable class-methods-use-this */
  async generateToken(email: string, password: string): Promise<AuthDTO> {
    try {
      const token = await FirebaseRestClient.signInWithPassword(
        email,
        password,
      );
      const user = await this.userService.getUserByEmail(email);
      return { ...token, ...user };
    } catch (error) {
      Logger.error(`Failed to generate token for user with email ${email}`);
      throw error;
    }
  }

  /* eslint-disable class-methods-use-this */
  async generateTokenOAuth(idToken: string): Promise<AuthDTO> {
    try {
      const googleUser = await FirebaseRestClient.signInWithGoogleOAuth(
        idToken,
      );
      // googleUser.idToken refers to the Firebase Auth access token for the user
      const token = {
        accessToken: googleUser.idToken,
        refreshToken: googleUser.refreshToken,
      };
      // If user already has a login with this email, just return the token
      try {
        // Note: an error message will be logged from UserService if this lookup fails.
        // You may want to silence the logger for this special OAuth user lookup case
        const user = await this.userService.getUserByEmail(googleUser.email);
        return { ...token, ...user };
        /* eslint-disable-next-line no-empty */
      } catch (error) {}

      const user = await this.userService.createUser({
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        email: googleUser.email,
        role: Role.STAFF,
      });

      return { ...token, ...user };
    } catch (error) {
      Logger.error(`Failed to generate token for user with OAuth ID token`);
      throw error;
    }
  }

  async revokeTokens(userId: string): Promise<void> {
    try {
      const authId = await this.userService.getAuthIdById(userId);

      await firebaseAdmin.auth().revokeRefreshTokens(authId);
    } catch (error) {
      const errorMessage = [
        "Failed to revoke refresh tokens of user with id",
        `${userId}.`,
        "Reason =",
        getErrorMessage(error),
      ];
      Logger.error(errorMessage.join(" "));

      throw error;
    }
  }

  async renewToken(refreshToken: string): Promise<Token> {
    try {
      return await FirebaseRestClient.refreshToken(refreshToken);
    } catch (error) {
      Logger.error("Failed to refresh token");
      throw error;
    }
  }

  async generateSignInLink(email: string): Promise<string> {
    const actionCodeSettings = {
      url: `http://localhost:3000/login/?email=${email}`,
      handleCodeInApp: true,
    };

    try {
      const signInLink = firebaseAdmin
        .auth()
        .generateSignInWithEmailLink(email, actionCodeSettings);
      return await signInLink;
    } catch (error) {
      Logger.error(
        `Failed to generate email sign-in link for user with email ${email}`,
      );
      throw error;
    }
  }

  async sendInviteEmail(
    name: string,
    email: string,
    role: string,
  ): Promise<void> {
    if (!this.emailService) {
      const errorMessage =
        "Attempted to call sendEmailVerificationLink but this instance of AuthService does not have an EmailService instance";
      Logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    try {
      let roleString =
        role === "Administrator" || role === "Animal Behaviourist"
          ? "an "
          : "a ";
      roleString += role;

      const signInLink = await this.generateSignInLink(email);
      const emailTemplate = fs.readFileSync(
        `${__dirname}/../../html-templates/email.html`,
        "utf8",
      );
      const renderedEmailTemplate = emailTemplate
        .replace("{{ name }}", name)
        .replace("{{ roleString }}", roleString)
        .replace(/{{ signInLink }}/g, signInLink);
      this.emailService.sendEmail(
        email,
        "Welcome to the Oakville and Milton Humane Society!",
        renderedEmailTemplate,
      );
    } catch (error) {
      Logger.error(
        `Failed to send email invite link for user with email ${email}`,
      );
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    if (!this.emailService) {
      const errorMessage =
        "Attempted to call sendPasswordResetEmail but this instance of AuthService does not have an EmailService instance";
      Logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    try {
      const firebaseLink = await firebaseAdmin
        .auth()
        .generatePasswordResetLink(email);
      const url = new URL(firebaseLink);
      const oobCode = url.searchParams.get("oobCode");
      if (!oobCode) {
        throw new Error("oobCode not found in Firebase reset link");
      }
      const customResetLink = `http://localhost:3000/reset-password?oobCode=${oobCode}`;
      const emailBody = `
        Hello,
        <br><br>
        We have received a password reset request for your account.
        Please click the following link to reset it.
        <strong>This link is only valid for 1 hour.</strong>
        <br><br>
        <a href="${customResetLink}">Reset Password</a>
      `;
      await this.emailService.sendEmail(
        email,
        "Your Password Reset Link",
        emailBody,
      );
    } catch (error) {
      Logger.error(
        `Failed to generate password reset link for user with email ${email}`,
      );
      throw error;
    }
  }
  /* async sendEmailVerificationLink(email: string): Promise<void> {
    if (!this.emailService) {
      const errorMessage =
        "Attempted to call sendEmailVerificationLink but this instance of AuthService does not have an EmailService instance";
      Logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    try {
      const emailVerificationLink = await firebaseAdmin
        .auth()
        .generateEmailVerificationLink(email);        
        const emailBody = `
      Hello,
      <br><br>
      You have been invited to the Oakville and Milton Humane Society as a <role>.
      <br><br>
      Please click the following link to verify your email and activate your account.
      <strong>This link is only valid for 1 hour.</strong>
      <br><br>
      <a href=${emailVerificationLink}>Verify email</a>
      <br><br>
      To log in for the first time, use this email and the following link.</strong>`;

      this.emailService.sendEmail(email, "Welcome to the Oakville and Milton Humane Society!", emailBody);
    } catch (error) {
      Logger.error(
        `Failed to generate email verification link for user with email ${email}`,
      );
      throw error;
    }
  } */

  async isAuthorizedByRole(
    accessToken: string,
    roles: Set<Role>,
  ): Promise<boolean> {
    try {
      const decodedIdToken: firebaseAdmin.auth.DecodedIdToken =
        await firebaseAdmin.auth().verifyIdToken(accessToken, true);
      const userRole = await this.userService.getUserRoleByAuthId(
        decodedIdToken.uid,
      );
      // const firebaseUser = await firebaseAdmin
      //   .auth()
      //   .getUser(decodedIdToken.uid);
      return /* firebaseUser.emailVerified && */ roles.has(userRole);
    } catch (error) {
      return false;
    }
  }

  async isAuthorizedByUserId(
    accessToken: string,
    requestedUserId: string,
  ): Promise<boolean> {
    try {
      const decodedIdToken: firebaseAdmin.auth.DecodedIdToken =
        await firebaseAdmin.auth().verifyIdToken(accessToken, true);
      const tokenUserId = await this.userService.getUserIdByAuthId(
        decodedIdToken.uid,
      );

      // const firebaseUser = await firebaseAdmin
      //   .auth()
      //   .getUser(decodedIdToken.uid);

      return (
        /* firebaseUser.emailVerified && */ String(tokenUserId) ===
        requestedUserId
      );
    } catch (error) {
      return false;
    }
  }

  async isAuthorizedByEmail(
    accessToken: string,
    requestedEmail: string,
  ): Promise<boolean> {
    try {
      const decodedIdToken: firebaseAdmin.auth.DecodedIdToken =
        await firebaseAdmin.auth().verifyIdToken(accessToken, true);

      const firebaseUser = await firebaseAdmin
        .auth()
        .getUser(decodedIdToken.uid);

      return (
        firebaseUser.emailVerified && decodedIdToken.email === requestedEmail
      );
    } catch (error) {
      return false;
    }
  }

  async setPassword(
    email: string,
    newPassword: string,
  ): Promise<ResponseSuccessDTO> {
    let errorMessage = "An unknown error occured. Please try again later.";
    try {
      const uid = await (await firebaseAdmin.auth().getUserByEmail(email)).uid;
      await firebaseAdmin.auth().updateUser(uid, {
        password: newPassword,
      });
      return { success: true } as ResponseSuccessDTO;
    } catch (error) {
      Logger.error(
        `Failed to update password. Error: ${getErrorMessage(error)}`,
      );
      if (error instanceof Error && "code" in error) {
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        if ((error as any).code === "auth/invalid-password") {
          errorMessage =
            "Password is too weak! Make sure it matches the password policy in Firebase.";
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        } else if ((error as any).code === "auth/user-not-found") {
          errorMessage = "No user found with the provided email!";
        }
      } else {
        errorMessage = "Unknown error occurred.";
      }
      return { success: false, errorMessage };
    }
  }
}

export default AuthService;
