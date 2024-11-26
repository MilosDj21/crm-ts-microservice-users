import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import fs from "fs";
import path from "path";

import { errorHandler } from "./middlewares/error-handling";
import { BadRequestError } from "./middlewares/CustomError";

import authRoutes from "./routes/auth";

export const createApp = () => {
  const clientAddress =
    process.env.ENVIRONMENT === "production"
      ? process.env.CLIENT_ADDRESS
      : "http://localhost:3000";

  const accessLogStream = fs.createWriteStream(
    path.join(__dirname, "./logs/access.log"),
    { flags: "a" },
  );

  const app = express();

  //middlewares
  app.use(express.json());
  app.use(
    cors({
      origin: clientAddress,
    }),
  );
  app.use(helmet());
  app.use(morgan("combined", { stream: accessLogStream }));
  // app.use("/images", express.static(path.join(__dirname, "images")));

  //routes
  app.get("/", (req, res) => {
    res.status(200).send("Home Page");
  });
  app.use("/api/v1", authRoutes);

  // Fallback route for non-existent endpoints
  app.use((req, res, next) => {
    next(new BadRequestError("Endpoint not found."));
  });

  //Error handler middleware must be used last, to be able to catch next(error) in controllers
  app.use(errorHandler);

  return app;
};
