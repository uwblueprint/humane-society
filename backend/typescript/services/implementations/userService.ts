import * as firebaseAdmin from "firebase-admin";
import IUserService from "../interfaces/userService";
import {
  CreateUserDTO,
  Role,
  UpdateUserDTO,
  UserDTO,
  UserStatus,
} from "../../types";
import { getErrorMessage, NotFoundError } from "../../utilities/errorUtils";
import logger from "../../utilities/logger";
import PgUser from "../../models/user.model";

const Logger = logger(__filename);

class UserService implements IUserService {
  /* eslint-disable class-methods-use-this */

  async getUserById(userId: string): Promise<UserDTO> {
    let user: PgUser | null;
    let firebaseUser: firebaseAdmin.auth.UserRecord;

    try {
      user = await PgUser.findByPk(Number(userId));
      if (!user) {
        throw new NotFoundError(`userId ${userId} not found in database.`);
      }

      firebaseUser = await firebaseAdmin.auth().getUser(user.auth_id);
    } catch (error: unknown) {
      Logger.error(`Failed to get user. Reason = ${getErrorMessage(error)}`);
      throw error;
    }

    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: firebaseUser.email ?? "",
      role: user.role,
      status: user.status,
      colorLevel: user.color_level,
      animalTags: user.animal_tags,
      canSeeAllLogs: user.can_see_all_logs,
      canAssignUsersToTasks: user.can_assign_users_to_tasks,
      phoneNumber: user.phone_number,
      profilePhoto: user.profile_photo,
    };
  }

  async getUserByEmail(email: string): Promise<UserDTO> {
    let user: PgUser | null;
    let firebaseUser: firebaseAdmin.auth.UserRecord;

    try {
      firebaseUser = await firebaseAdmin.auth().getUserByEmail(email);
      user = await PgUser.findOne({
        where: { auth_id: firebaseUser.uid },
      });

      if (!user) {
        throw new NotFoundError(
          `userId with authID ${firebaseUser.uid} not found.`,
        );
      }
    } catch (error: unknown) {
      Logger.error(`Failed to get user. Reason = ${getErrorMessage(error)}`);
      throw error;
    }

    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: firebaseUser.email ?? "",
      role: user.role,
      status: user.status,
      colorLevel: user.color_level,
      animalTags: user.animal_tags,
      canSeeAllLogs: user.can_see_all_logs,
      canAssignUsersToTasks: user.can_assign_users_to_tasks,
      phoneNumber: user.phone_number,
      profilePhoto: user.profile_photo,
    };
  }

  async getUserRoleByAuthId(authId: string): Promise<Role> {
    try {
      const user: PgUser | null = await PgUser.findOne({
        where: { auth_id: authId },
      });

      if (!user) {
        throw new NotFoundError(`User with authId ${authId} not found.`);
      }

      if (!user.role) {
        throw new Error(`Role for user with authId ${authId} is invalid.`);
      }

      return user.role;
    } catch (error: unknown) {
      Logger.error(
        `Failed to get user role. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  async getUserIdByAuthId(authId: string): Promise<string> {
    try {
      const user: PgUser | null = await PgUser.findOne({
        where: { auth_id: authId },
      });
      if (!user) {
        throw new NotFoundError(`user with authId ${authId} not found.`);
      }
      return String(user.id);
    } catch (error: unknown) {
      Logger.error(`Failed to get user id. Reason = ${getErrorMessage(error)}`);
      throw error;
    }
  }

  async getAuthIdById(userId: string): Promise<string> {
    try {
      const user: PgUser | null = await PgUser.findByPk(Number(userId));
      if (!user) {
        throw new NotFoundError(`userId ${userId} not found.`);
      }
      return user.auth_id;
    } catch (error: unknown) {
      Logger.error(`Failed to get authId. Reason = ${getErrorMessage(error)}`);
      throw error;
    }
  }

  async getUsers(): Promise<Array<UserDTO>> {
    let userDtos: Array<UserDTO> = [];
    try {
      const users: Array<PgUser> = await PgUser.findAll();

      userDtos = await Promise.all(
        users.map(async (user) => {
          let firebaseUser: firebaseAdmin.auth.UserRecord;

          try {
            firebaseUser = await firebaseAdmin.auth().getUser(user.auth_id);
          } catch (error) {
            Logger.error(
              `user with authId ${user.auth_id} could not be fetched from Firebase`,
            );
            throw error;
          }

          return {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            name: `${user.first_name} ${user.last_name}`,
            email: firebaseUser.email ?? "",
            role: user.role,
            status: user.status,
            colorLevel: user.color_level,
            animalTags: user.animal_tags,
            canSeeAllLogs: user.can_see_all_logs,
            canAssignUsersToTasks: user.can_assign_users_to_tasks,
            phoneNumber: user.phone_number,
            profilePhoto: user.profile_photo,
          };
        }),
      );
    } catch (error: unknown) {
      Logger.error(`Failed to get users. Reason = ${getErrorMessage(error)}`);
      throw error;
    }

    return userDtos;
  }

  async createUser(user: CreateUserDTO): Promise<UserDTO> {
    let newUser: PgUser;
    let firebaseUser: firebaseAdmin.auth.UserRecord;
    try {
      firebaseUser = await firebaseAdmin.auth().createUser({
        email: user.email,
      });

      try {
        newUser = await PgUser.create({
          first_name: user.firstName,
          last_name: user.lastName,
          auth_id: firebaseUser.uid,
          role: user.role,
          status: UserStatus.INACTIVE,
          color_level: 1,
          email: firebaseUser.email ?? "",
          animal_tags: [],
          can_see_all_logs: user.canSeeAllLogs,
          can_assign_users_to_tasks: user.canAssignUsersToTasks,
          phone_number: user.phoneNumber,
          profile_photo: "",
        });
      } catch (postgresError) {
        try {
          await firebaseAdmin.auth().deleteUser(firebaseUser.uid);
        } catch (firebaseError: unknown) {
          const errorMessage = [
            "Failed to rollback Firebase user creation after Postgres user creation failure. Reason =",
            getErrorMessage(firebaseError),
            "Orphaned authId (Firebase uid) =",
            firebaseUser.uid,
          ];
          Logger.error(errorMessage.join(" "));
        }

        throw postgresError;
      }
    } catch (error: unknown) {
      Logger.error(`Failed to create user. Reason = ${getErrorMessage(error)}`);
      throw error;
    }

    return {
      id: newUser.id,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      email: firebaseUser.email ?? "",
      role: newUser.role,
      status: newUser.status,
      colorLevel: newUser.color_level,
      animalTags: newUser.animal_tags,
      canSeeAllLogs: newUser.can_see_all_logs,
      canAssignUsersToTasks: newUser.can_assign_users_to_tasks,
      phoneNumber: newUser.phone_number,
      profilePhoto: newUser.profile_photo,
    };
  }

  async updateUserById(userId: number, user: UpdateUserDTO): Promise<UserDTO> {
    let updatedFirebaseUser: firebaseAdmin.auth.UserRecord;

    try {
      const updateResult = await PgUser.update(
        {
          first_name: user.firstName,
          last_name: user.lastName,
          email: user.email,
          role: user.role,
          status: user.status,
          color_level: user.colorLevel,
          animal_tags: user.animalTags,
          can_see_all_logs: user.canSeeAllLogs,
          can_assign_users_to_tasks: user.canAssignUsersToTasks,
          phone_number: user.phoneNumber,
          profile_photo: user.profilePhoto,
        },
        {
          where: { id: userId },
          returning: true,
        },
      );

      // check number of rows affected
      if (updateResult[0] < 1) {
        throw new Error(`userId ${userId} not found.`);
      }

      // the cast to "any" is needed due to a missing property in the Sequelize type definitions
      // https://github.com/sequelize/sequelize/issues/9978#issuecomment-426342219
      /* eslint-disable-next-line no-underscore-dangle, @typescript-eslint/no-explicit-any */
      const oldUser: PgUser = (updateResult[1][0] as any)._previousDataValues;

      try {
        updatedFirebaseUser = await firebaseAdmin
          .auth()
          .updateUser(oldUser.auth_id, { email: user.email });
      } catch (error) {
        // rollback Postgres user updates
        try {
          await PgUser.update(
            {
              first_name: oldUser.first_name,
              last_name: oldUser.last_name,
              email: oldUser.email,
              role: oldUser.role,
              status: oldUser.status,
              color_level: oldUser.color_level,
              animal_tags: oldUser.animal_tags,
              can_see_all_logs: oldUser.can_see_all_logs,
              can_assign_users_to_tasks: oldUser.can_assign_users_to_tasks,
              phone_number: oldUser.phone_number,
              profile_photo: oldUser.profile_photo,
            },
            {
              where: { id: userId },
            },
          );
        } catch (postgresError: unknown) {
          const errorMessage = [
            "Failed to rollback Postgres user update after Firebase user update failure. Reason =",
            getErrorMessage(postgresError),
            "Postgres user id with possibly inconsistent data =",
            oldUser.id,
          ];
          Logger.error(errorMessage.join(" "));
        }

        throw error;
      }
    } catch (error: unknown) {
      Logger.error(`Failed to update user. Reason = ${getErrorMessage(error)}`);
      throw error;
    }

    return {
      id: userId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: updatedFirebaseUser.email ?? "",
      role: user.role,
      status: user.status,
      colorLevel: user.colorLevel,
      animalTags: user.animalTags,
      canSeeAllLogs: user.canSeeAllLogs,
      canAssignUsersToTasks: user.canAssignUsersToTasks,
      phoneNumber: user.phoneNumber,
      profilePhoto: user.profilePhoto,
    };
  }

  async deleteUserById(userId: number): Promise<void> {
    try {
      // Sequelize doesn't provide a way to atomically find, delete, and return deleted row
      const deletedUser: PgUser | null = await PgUser.findByPk(Number(userId));

      if (!deletedUser) {
        throw new Error(`userid ${userId} not found.`);
      }

      const numDestroyed: number = await PgUser.destroy({
        where: { id: userId },
      });

      if (numDestroyed <= 0) {
        throw new Error(`userid ${userId} was not deleted in Postgres.`);
      }

      try {
        await firebaseAdmin.auth().deleteUser(deletedUser.auth_id);
      } catch (error) {
        // rollback user deletion in Postgres
        try {
          await PgUser.create({
            first_name: deletedUser.first_name,
            last_name: deletedUser.last_name,
            auth_id: deletedUser.auth_id,
            role: deletedUser.role,
            status: deletedUser.status,
            color_level: deletedUser.color_level,
            animal_tags: deletedUser.animal_tags,
            can_see_all_logs: deletedUser.can_see_all_logs,
            can_assign_users_to_tasks: deletedUser.can_assign_users_to_tasks,
            phone_number: deletedUser.phone_number,
            profile_photo: deletedUser.profile_photo,
          });
        } catch (postgresError: unknown) {
          const errorMessage = [
            "Failed to rollback Postgres user deletion after Firebase user deletion failure. Reason =",
            getErrorMessage(postgresError),
            "Firebase uid with non-existent Postgres record =",
            deletedUser.auth_id,
          ];
          Logger.error(errorMessage.join(" "));
        }

        throw error;
      }
    } catch (error: unknown) {
      Logger.error(`Failed to delete user. Reason = ${getErrorMessage(error)}`);
      throw error;
    }
  }

  async deleteUserByEmail(email: string): Promise<void> {
    try {
      const firebaseUser: firebaseAdmin.auth.UserRecord = await firebaseAdmin
        .auth()
        .getUserByEmail(email);
      const deletedUser: PgUser | null = await PgUser.findOne({
        where: { auth_id: firebaseUser.uid },
      });

      if (!deletedUser) {
        throw new Error(`userid ${firebaseUser.uid} not found.`);
      }

      const numDestroyed: number = await PgUser.destroy({
        where: { auth_id: firebaseUser.uid },
      });

      if (numDestroyed <= 0) {
        throw new Error(
          `userid ${firebaseUser.uid} was not deleted in Postgres.`,
        );
      }

      try {
        await firebaseAdmin.auth().deleteUser(deletedUser.auth_id);
      } catch (error) {
        // rollback user deletion in Postgres
        try {
          await PgUser.create({
            first_name: deletedUser.first_name,
            last_name: deletedUser.last_name,
            auth_id: deletedUser.auth_id,
            role: deletedUser.role,
            status: deletedUser.status,
            color_level: deletedUser.color_level,
            animal_tags: deletedUser.animal_tags,
            can_see_all_logs: deletedUser.can_see_all_logs,
            can_assign_users_to_tasks: deletedUser.can_assign_users_to_tasks,
            phone_number: deletedUser.phone_number,
            profile_photo: deletedUser.profile_photo,
          });
        } catch (postgresError: unknown) {
          const errorMessage = [
            "Failed to rollback Postgres user deletion after Firebase user deletion failure. Reason =",
            getErrorMessage(postgresError),
            "Firebase uid with non-existent Postgres record =",
            deletedUser.auth_id,
          ];
          Logger.error(errorMessage.join(" "));
        }

        throw error;
      }
    } catch (error: unknown) {
      Logger.error(`Failed to delete user. Reason = ${getErrorMessage(error)}`);
      throw error;
    }
  }
}

export default UserService;
