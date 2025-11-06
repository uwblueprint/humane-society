import * as path from "path";
import { Sequelize } from "sequelize-typescript";
import User from "./user.model";
// import defineRelationships from "./modelRelationships";
import InteractionTypeModel from "./interactionType";
import InteractionModel from "./interaction";
import { DataTypes } from "sequelize";

const DATABASE_URL =
  process.env.NODE_ENV === "production"
    ? /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
      process.env.DATABASE_URL!
    : `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.DB_HOST}:5432/${process.env.POSTGRES_DB_DEV}`;

/* eslint-disable-next-line import/prefer-default-export */
const sequelize = new Sequelize(DATABASE_URL, {
  models: [path.join(__dirname, "/*.model.ts")],
});

sequelize.addModels([User]);

// defineRelationships();

const InteractionType = InteractionTypeModel(sequelize, DataTypes);
sequelize.models.InteractionType = InteractionType;

const Interaction = InteractionModel(sequelize, DataTypes);
sequelize.models.Interaction = Interaction;


export { sequelize, User };


