import * as firebaseAdmin from "firebase-admin";

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

  async revokeTokens(userId: string): Promise<void> {
    try {
      const authId = await this.userService.getAuthIdById(userId);

      await firebaseAdmin.auth().revokeRefreshTokens(authId);
    } catch (error: unknown) {
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

  async sendInviteEmail(email: string, role: string): Promise<void> {
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
      const emailBody = `
      Hello,
      <br><br>
      You have been invited to the Oakville and Milton Humane Society as ${roleString}.
      <br><br>
      Please click the following link to verify your email and activate your account.
      <strong>This link is only valid for 6 hours.</strong>
      <br><br>
      <a href=${signInLink}>Verify email</a>
      <br><br>
      To log in for the first time, use this email and the following link.</strong>`;
      this.emailService.sendEmail(
        email,
        "Welcome to the Oakville and Milton Humane Society!",
        emailBody,
      );
    } catch (error) {
      Logger.error(
        `Failed to send email invite link for user with email ${email}`,
      );
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    if (!this.emailService) {
      const errorMessage =
        "Attempted to call resetPassword but this instance of AuthService does not have an EmailService instance";
      Logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    try {
      const resetLink = await firebaseAdmin
        .auth()
        .generatePasswordResetLink(email);
      const emailBody = `
      Hello,
      <br><br>
      We have received a password reset request for your account.
      Please click the following link to reset it.
      <strong>This link is only valid for 1 hour.</strong>
      <br><br>
      <a href=${resetLink}>Reset Password</a>`;

      this.emailService.sendEmail(email, "Your Password Reset Link", emailBody);
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
      const decodedIdToken: firebaseAdmin.auth.DecodedIdToken = await firebaseAdmin
        .auth()
        .verifyIdToken(accessToken, true);
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
      const decodedIdToken: firebaseAdmin.auth.DecodedIdToken = await firebaseAdmin
        .auth()
        .verifyIdToken(accessToken, true);
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
      const decodedIdToken: firebaseAdmin.auth.DecodedIdToken = await firebaseAdmin
        .auth()
        .verifyIdToken(accessToken, true);

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
    } catch (error: any) {
      Logger.error(`Failed to update password. Error: ${error}`);
      if (error.code === "auth/invalid-password") {
        errorMessage =
          "Password is too weak! Make sure it matches the password policy in Firebase.";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "No user found with the provided email!";
      }
      return { success: false, errorMessage };
    }
  }
}

export default AuthService;
