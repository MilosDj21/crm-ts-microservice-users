import "reflect-metadata";
import "dotenv/config";
import AppDataSource from "./data-source";

//db connection and connecting kafka client
AppDataSource.initialize()
  .then(() => {
    console.log("Connected to the database");
    //TODO: inicijalizuj kafka client
  })
  .catch((error: any) => console.log(error));
