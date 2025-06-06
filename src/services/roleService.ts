import { In, Like, Repository } from "typeorm";
import Role from "../entity/Role";
import { BadRequestError, NotFoundError } from "../errors/CustomError";
import AppDataSource from "../data-source";
import UserService from "./userService";

class RoleService {
  private roleRepository: Repository<Role>;

  constructor() {
    this.roleRepository = AppDataSource.getRepository(Role);
  }

  public findById = async (id: number) => {
    if (isNaN(id)) throw new BadRequestError("Invalid role id");

    const role = await this.roleRepository.findOneBy({ id });
    if (!role) throw new NotFoundError("Role not found");

    return role;
  };

  public findByIdList = async (idList: number[]) => {
    const roles = await this.roleRepository.findBy({
      id: In(idList),
    });
    if (!roles) throw new NotFoundError("Roles not found");
    return roles;
  };

  public findByUserId = async (userId: number) => {
    const userService = new UserService();
    const user = await userService.findById(userId);
    return user.roles;
  };

  public findAll = async (searchTerm: string = "") => {
    const roles = await this.roleRepository.findBy({
      name: Like(`%${searchTerm}%`),
    });
    if (!roles) throw new NotFoundError("Roles not found");

    return roles;
  };

  public create = async (name: string) => {
    const exist = await this.roleRepository.findOneBy({ name });
    if (exist) throw new BadRequestError("Role already exists");

    const role = await this.roleRepository.save({
      name,
    });
    if (!role) throw new Error("Failed to save role to the db");

    return role;
  };

  public update = async (id: number, name: string) => {
    if (isNaN(id)) throw new BadRequestError("Invalid role id");

    const role = await this.roleRepository.update(id, { name });
    if (!role) throw new Error("Failed to update role in db");

    return role;
  };

  public removeById = async (id: number) => {
    if (isNaN(id)) throw new BadRequestError("Invalid role id");

    const role = await this.roleRepository.delete(id);

    return role;
  };
}

export default RoleService;
