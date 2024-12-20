import { DataSource } from "typeorm";
import User from "./entity/User";
import Role from "./entity/Role";

const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: true,
  entities: [User, Role],
});

export default AppDataSource;
