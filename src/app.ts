import "reflect-metadata";
import "dotenv/config";
import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { fileURLToPath } from "url";
import { dirname } from "path";

import AppDataSource from "./data-source.js";

// import userRoutes from "./routes/user";

const clientAddress =
  process.env.ENVIRONMENT === "production"
    ? process.env.CLIENT_ADDRESS
    : "http://localhost:3000";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" },
);

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

//db connection and starting express server
AppDataSource.initialize()
  .then(() => {
    console.log("Connected to the database");
    app.listen(process.env.PORT, () =>
      console.log(`Listening on port: ${process.env.PORT}`),
    );
  })
  .catch((error: any) => console.log(error));

//routes
app.get("/", (req, res) => {
  res.status(200).send("Home Page");
});
// app.use("/users", userRoutes);
