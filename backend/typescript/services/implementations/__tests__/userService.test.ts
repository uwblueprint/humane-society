import { snakeCase } from "lodash";

import UserModel from "../../../models/user.model";
import UserService from "../userService";

import { RoleId, UserDTO, DTOTypes } from "../../../types";

import { testSql } from "../../../testUtils/testDb";

const testUsers = [
  {
    firstName: "Peter",
    lastName: "Pan",
    authId: "123",
    roleId: RoleId.Administrator,
  },
  {
    firstName: "Wendy",
    lastName: "Darling",
    authId: "321",
    roleId: RoleId.Staff,
  },
];

jest.mock("firebase-admin", () => {
  const auth = jest.fn().mockReturnValue({
    getUser: jest.fn().mockReturnValue({ email: "test@test.com" }),
  });
  return { auth };
});

describe("pg userService", () => {
  let userService: UserService;

  beforeEach(async () => {
    await testSql.sync({ force: true });
    userService = new UserService();
  });

  afterAll(async () => {
    await testSql.sync({ force: true });
    await testSql.close();
  });

  it("getUsers", async () => {
    const users = testUsers.map((user) => {
      const userSnakeCase: DTOTypes = {};
      Object.entries(user).forEach(([key, value]) => {
        userSnakeCase[snakeCase(key)] = value;
      });
      return userSnakeCase;
    });

    await UserModel.bulkCreate(users);

    const res = await userService.getUsers();

    res.forEach((user: UserDTO, i) => {
      expect(user.firstName).toEqual(testUsers[i].firstName);
      expect(user.lastName).toEqual(testUsers[i].lastName);
      expect(user.roleId).toEqual(testUsers[i].roleId);
    });
  });
});
