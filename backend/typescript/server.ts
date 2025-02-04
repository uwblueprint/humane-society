import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import * as firebaseAdmin from "firebase-admin";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

import { sequelize } from "./models";
import authRouter from "./rest/authRoutes";
import activityTypeRouter from "./rest/activityTypeRoutes";
import behaviourRouter from "./rest/behaviourRoutes";
import animalTypeRouter from "./rest/animalTypeRoutes";
import entityRouter from "./rest/entityRoutes";
import petRouter from "./rest/petRoutes";
import simpleEntityRouter from "./rest/simpleEntityRoutes";
import userRouter from "./rest/userRoutes";
import activityRouter from "./rest/activityRoutes";

const CORS_ALLOW_LIST = [
  "http://localhost:3000",
  "https://uw-blueprint-starter-code.firebaseapp.com",
  "https://uw-blueprint-starter-code.web.app",
  /^https:\/\/uw-blueprint-starter-code--pr.*\.web\.app$/,
];

const CORS_OPTIONS: cors.CorsOptions = {
  origin: CORS_ALLOW_LIST,
  credentials: true,
};

const swaggerDocument = YAML.load("swagger.yml");

const app = express();
app.use(cookieParser());
app.use(cors(CORS_OPTIONS));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRouter);
app.use("/activity-types", activityTypeRouter);
app.use("/animal-types", animalTypeRouter);
app.use("/behaviours", behaviourRouter);
app.use("/entities", entityRouter);
app.use("/pets", petRouter);
app.use("/simple-entities", simpleEntityRouter);
app.use("/users", userRouter);
app.use("/activities", activityRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

sequelize.authenticate();

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_SVC_ACCOUNT_PRIVATE_KEY?.replace(
      /\\n/g,
      "\n",
    ),
    clientEmail: process.env.FIREBASE_SVC_ACCOUNT_CLIENT_EMAIL,
  }),
});

app.listen({ port: process.env.PORT || 8080 }, () => {
  /* eslint-disable-next-line no-console */
  console.info(`Server is listening on port ${process.env.PORT || 8080}!`);
});
