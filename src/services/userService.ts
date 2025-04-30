import { Repository } from "typeorm";

import User from "../entity/User";
import { BadRequestError, NotFoundError } from "../errors/CustomError";
import AppDataSource from "../data-source";
import RoleService from "./roleService";

class UserService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  public findById = async (id: number) => {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundError("User not found");
    return user;
  };

  public findByEmail = async (email: string) => {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) throw new NotFoundError("User not found");
    return user;
  };

  public findAll = async () => {
    const userList = await this.userRepository.find();
    if (!userList) throw new NotFoundError("Users not found");
    return userList;
  };

  //NOTE: userObject must be of type any
  //because roles are number[], and after that they are converted to Role[]
  public create = async (userObject: any) => {
    const exist = await this.userRepository.findOneBy({
      email: userObject.email,
    });
    if (exist) throw new BadRequestError("Email already in use!");

    const roleService = new RoleService();
    const roles = await roleService.findByIdList(userObject.roles);

    userObject.roles = roles;

    const user = await this.userRepository.save(userObject);
    if (!user) throw new Error("Failed to save user to the db");

    return user;
  };

  public update = async (userObject: any) => {
    const user = await this.userRepository.update(userObject.id, userObject);
    if (!user) throw new Error("Failed to update user");
    return user;
  };

  public removeById = async (id: number) => {
    const user = await this.userRepository.delete(id);
    return user;
  };
}

export default UserService;
