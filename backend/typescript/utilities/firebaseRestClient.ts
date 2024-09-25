import fetch, { Response } from "node-fetch";

import { Token, VerifyPasswordResponse, ConfirmPasswordResetResponse } from "../types";
import logger from "./logger";

const Logger = logger(__filename);

const FIREBASE_SIGN_IN_URL =
  "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword";
const FIREBASE_REFRESH_TOKEN_URL =
  "https://securetoken.googleapis.com/v1/token";
const FIREBASE_OAUTH_SIGN_IN_URL =
  "https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp";
const FIREBASE_VERIFY_PASSWORD_RESET_CODE_URL = 
  "https://identitytoolkit.googleapis.com/v1/accounts:resetPassword";
const FIREBASE_CONFIRM_PASSWORD_RESET_URL = 
  "https://identitytoolkit.googleapis.com/v1/accounts:resetPassword";

type PasswordSignInResponse = {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered: boolean;
};

type OAuthSignInResponse = {
  federatedId: string;
  providerId: string;
  localId: string;
  emailVerified: boolean;
  email: string;
  oauthIdToken: string;
  oauthAccessToken: string;
  oauthTokenSecret: string;
  rawUserInfo: string;
  firstName: string;
  lastName: string;
  fullName: string;
  displayName: string;
  photoUrl: string;
  idToken: string;
  refreshToken: string;
  expiresIn: string;
  needConfirmation: boolean;
};

type RefreshTokenResponse = {
  expires_in: string;
  token_type: string;
  refresh_token: string;
  id_token: string;
  user_id: string;
  project_id: string;
};

type RequestError = {
  error: {
    code: number;
    message: string;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    errors: any;
  };
};


const FirebaseRestClient = {
  // Docs: https://firebase.google.com/docs/reference/rest/auth/#section-sign-in-email-password
  signInWithPassword: async (
    email: string,
    password: string,
  ): Promise<Token> => {
    const response: Response = await fetch(
      `${FIREBASE_SIGN_IN_URL}?key=${process.env.FIREBASE_WEB_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      },
    );

    const responseJson:
      | PasswordSignInResponse
      | RequestError = await response.json();

    if (!response.ok) {
      const errorMessage = [
        "Failed to sign-in via Firebase REST API, status code =",
        `${response.status},`,
        "error message =",
        (responseJson as RequestError).error.message,
      ];
      Logger.error(errorMessage.join(" "));

      throw new Error("Failed to sign-in via Firebase REST API");
    }

    return {
      accessToken: (responseJson as PasswordSignInResponse).idToken,
      refreshToken: (responseJson as PasswordSignInResponse).refreshToken,
    };
  },

  // Docs: https://firebase.google.com/docs/reference/rest/auth/#section-sign-in-with-oauth-credential
  signInWithGoogleOAuth: async (
    idToken: string,
  ): Promise<OAuthSignInResponse> => {
    const response: Response = await fetch(
      `${FIREBASE_OAUTH_SIGN_IN_URL}?key=${process.env.FIREBASE_WEB_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postBody: `id_token=${idToken}&providerId=google.com`,
          requestUri: process.env.FIREBASE_REQUEST_URI,
          returnIdpCredential: true,
          returnSecureToken: true,
        }),
      },
    );

    const responseJson:
      | OAuthSignInResponse
      | RequestError = await response.json();

    if (!response.ok) {
      const errorMessage = [
        "Failed to sign-in via Firebase REST API with OAuth, status code =",
        `${response.status},`,
        "error message =",
        (responseJson as RequestError).error.message,
      ];
      Logger.error(errorMessage.join(" "));

      throw new Error("Failed to sign-in via Firebase REST API");
    }

    return responseJson as OAuthSignInResponse;
  },

  // Docs: https://firebase.google.com/docs/reference/rest/auth/#section-refresh-token
  refreshToken: async (refreshToken: string): Promise<Token> => {
    const response: Response = await fetch(
      `${FIREBASE_REFRESH_TOKEN_URL}?key=${process.env.FIREBASE_WEB_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
      },
    );

    const responseJson:
      | RefreshTokenResponse
      | RequestError = await response.json();

    if (!response.ok) {
      const errorMessage = [
        "Failed to refresh token via Firebase REST API, status code =",
        `${response.status},`,
        "error message =",
        (responseJson as RequestError).error.message,
      ];
      Logger.error(errorMessage.join(" "));

      throw new Error("Failed to refresh token via Firebase REST API");
    }

    return {
      accessToken: (responseJson as RefreshTokenResponse).id_token,
      refreshToken: (responseJson as RefreshTokenResponse).refresh_token,
    };
  },

  // Docs: https://firebase.google.com/docs/reference/rest/auth/#section-verify-password-reset-code
  verifyPasswordResetCode: async(oobCode: string):  Promise<VerifyPasswordResponse>=> {
    const response: Response = await fetch(
      `${FIREBASE_VERIFY_PASSWORD_RESET_CODE_URL}?key=${process.env.FIREBASE_WEB_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({oobCode:oobCode})
      }
    )
    const responseJson:
    | VerifyPasswordResponse
    | RequestError = await response.json();
    
    if (!response.ok) {
      const errorMessage = [
        "Failed to verify password reset code, status code =",
        `${response.status},`,
        "error message =",
        (responseJson as RequestError).error.message,        
      ]
      Logger.error(errorMessage.join(" "));

      throw new Error("Failed to verify password reset code.");
    }
    return responseJson as VerifyPasswordResponse
  },

  // Docs: https://firebase.google.com/docs/reference/rest/auth/#section-confirm-reset-password
  confirmPasswordReset: async(oobCode: string, newPassword: string): Promise<ConfirmPasswordResetResponse> => {
    const response: Response = await fetch(
      `${FIREBASE_CONFIRM_PASSWORD_RESET_URL}?key=${process.env.FIREBASE_WEB_API_KEY}`, 
      {
        method:"POST", 
        headers: {
          "Content-Type":"application/json",
        },
        body: JSON.stringify({oobCode:oobCode, newPassword:newPassword}) // is this secure ?????
      }
    )
    const responseJson:
    | ConfirmPasswordResetResponse
    | RequestError = await response.json();
    
    if (!response.ok) {
      const errorMessage = [
        "Failed to reset password, status code =",
        `${response.status},`,
        "error message =",
        (responseJson as RequestError).error.message,        
      ]
      Logger.error(errorMessage.join(" "));

      throw new Error("Failed to reset password.");
    }
    return responseJson as ConfirmPasswordResetResponse
  }
};

export default FirebaseRestClient;
