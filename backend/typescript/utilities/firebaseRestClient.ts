import fetch, { Response } from "node-fetch";

import { Token } from "../types";
import logger from "./logger";

const EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST; // e.g. "host.docker.internal:9099"
const USING_EMULATOR = Boolean(EMULATOR_HOST);
const API_KEY = USING_EMULATOR
  ? process.env.FIREBASE_WEB_API_KEY || "fake-api-key"
  : process.env.FIREBASE_WEB_API_KEY || "";

// Helper to build a full URL for emulator vs prod.
// Pass only the path portion (starting with /...googleapis.com/....)
function buildUrl(path: string): string {
  if (USING_EMULATOR) {
    // Emulator expects the googleapis host in the PATH, and http scheme.
    return `http://${EMULATOR_HOST}${path}?key=${API_KEY}`;
  }
  // Prod: just turn path into https://<host-and-path>?key=...
  return `https://${path.slice(1)}?key=${API_KEY}`;
}

const Logger = logger(__filename);

const IDENTITYTOOLKIT_PASSWORD_PATH =
  "/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword";
const IDENTITYTOOLKIT_OAUTH_PATH =
  "/identitytoolkit.googleapis.com/v1/accounts:signInWithIdp";
const SECURETOKEN_REFRESH_PATH = "/securetoken.googleapis.com/v1/token";

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
      `${buildUrl(IDENTITYTOOLKIT_PASSWORD_PATH)}?key=${
        process.env.FIREBASE_WEB_API_KEY
      }`,
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

    const responseJson: PasswordSignInResponse | RequestError =
      await response.json();

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
      `${buildUrl(IDENTITYTOOLKIT_OAUTH_PATH)}?key=${
        process.env.FIREBASE_WEB_API_KEY
      }`,
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

    const responseJson: OAuthSignInResponse | RequestError =
      await response.json();

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
      `${buildUrl(SECURETOKEN_REFRESH_PATH)}?key=${
        process.env.FIREBASE_WEB_API_KEY
      }`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
      },
    );

    const responseJson: RefreshTokenResponse | RequestError =
      await response.json();

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
};

export default FirebaseRestClient;
