import { Like, Repository } from "typeorm";
import Role from "../entity/Role";
import { BadRequestError } from "../middlewares/CustomError";

class RoleService {
  private roleRepository: Repository<Role>;

  constructor(roleRepository: Repository<Role>) {
    this.roleRepository = roleRepository;
  }

  findOne = async (id: string) => {
    const idNum = parseInt(id);
    if (isNaN(idNum)) throw new BadRequestError("Invalid role id");

    const role = await this.roleRepository.findOneBy({ id: idNum });
    if (!role) throw new Error("Failed to retrieve role from the db");

    return role;
  };

  find = async (searchTerm: string = "") => {
    const roles = await this.roleRepository.findBy({
      name: Like(`%${searchTerm}%`),
    });
    if (!roles) throw Error("Failed to retrieve roles from the db");

    return roles;
  };

  saveOne = async (name: string) => {
    const exist = await this.roleRepository.findOneBy({ name });
    if (exist) throw new BadRequestError("Role already exists");

    const role = await this.roleRepository.save({
      name,
    });
    if (!role) throw new Error("Failed to save role to the db");

    return role;
  };

  updateOne = async (id: string, name: string) => {
    const idNum = parseInt(id);
    if (isNaN(idNum)) throw new BadRequestError("Invalid role id");

    const role = await this.roleRepository.update(idNum, { name });
    if (!role) throw new Error("Failed to update role in db");

    return role;
  };

  deleteOne = async (id: string) => {
    const idNum = parseInt(id);
    if (isNaN(idNum)) throw new BadRequestError("Invalid role id");

    const role = await this.roleRepository.delete(idNum);

    return role;
  };
}

export default RoleService;
