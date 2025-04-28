import { In, Repository } from "typeorm";

import User from "../entity/User";
import { BadRequestError } from "../errors/CustomError";
import Role from "../entity/Role";

class UserService {
  private userRepository: Repository<User>;
  private roleRepository: Repository<Role>;

  constructor(
    userRepository: Repository<User>,
    roleRepository: Repository<Role>,
  ) {
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
  }

  //TODO: zavrsi implementaciju ostalih, i refactor create
  public findById = async (id: number) => {};

  public findByEmail = async (email: string) => {};

  public findAll = async () => {};

  public create = async (userObject: User) => {
    const exist = await this.userRepository.findOneBy({
      email: userObject.email,
    });
    if (exist) throw new BadRequestError("Email already in use!");

    const roleService = new RoleService();
    const roles = await roleService.findByIdList(userObject.roles);
    if (!roles) throw new BadRequestError("Non existent roles!");

    userObject.roles = roles;

    const user = await this.userRepository.save(userObject);
    if (!user) throw new Error("Failed to save user to the db");

    return user;
  };

  public update = async (id: number) => {};

  public removeById = async (id: number) => {};
}

export default UserService;
