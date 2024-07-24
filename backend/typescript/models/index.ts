import * as path from "path";
import { Sequelize } from "sequelize-typescript";
import User from "./user.model";
import AnimalType from "./animalType.model";
import UserAnimalTypes from "./userAnimalTypes.model";

const DATABASE_URL =
  process.env.NODE_ENV === "production"
    ? /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
      process.env.DATABASE_URL!
    : `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.DB_HOST}:5432/${process.env.POSTGRES_DB_DEV}`;

const sequelize = new Sequelize(DATABASE_URL, {
  models: [path.join(__dirname, "/*.model.ts")],
});

/* eslint-disable-next-line import/prefer-default-export */
sequelize.addModels([User, AnimalType, UserAnimalTypes]);

User.belongsToMany(AnimalType, {
  through: UserAnimalTypes,
  constraints: false,
});
AnimalType.belongsToMany(User, {
  through: UserAnimalTypes,
  constraints: false,
});

export { sequelize, User, AnimalType, UserAnimalTypes };
