import PgUser from "../models/user.model";
import { SYSTEM_USER_AUTH_ID } from "../types";
import { NotFoundError } from "./errorUtils";

let cachedSystemUserId: number | undefined;

// eslint-disable-next-line import/prefer-default-export
export const getSystemUserId = async (): Promise<number> => {
  if (cachedSystemUserId !== undefined) {
    return cachedSystemUserId;
  }

  const systemUser = await PgUser.findOne({
    where: { auth_id: SYSTEM_USER_AUTH_ID },
    raw: true,
  });

  if (!systemUser) {
    throw new NotFoundError(
      "System user not found - has the seed-system-user migration been run?",
    );
  }

  const systemUserId: number = systemUser.id;
  cachedSystemUserId = systemUserId;
  return systemUserId;
};
