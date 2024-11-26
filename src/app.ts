import "reflect-metadata";
import "dotenv/config";
import AppDataSource from "./data-source";

import { createApp } from "./createApp";

const app = createApp();

//db connection and starting express server
AppDataSource.initialize()
  .then(() => {
    console.log("Connected to the database");
    app.listen(process.env.PORT, () =>
      console.log(`Listening on port: ${process.env.PORT}`),
    );
  })
  .catch((error: any) => console.log(error));
