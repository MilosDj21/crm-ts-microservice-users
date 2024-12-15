import { Repository } from "typeorm";
import Role from "../entity/Role";
import { BadRequestError } from "../middlewares/CustomError";

class RoleService {
  private roleRepository: Repository<Role>;

  constructor(roleRepository: Repository<Role>) {
    this.roleRepository = roleRepository;
  }

  saveOne = async (name: string) => {
    const exist = await this.roleRepository.findOneBy({ name });
    if (exist) throw new BadRequestError("Role already exists");

    const role = await this.roleRepository.save({
      name,
    });
    if (!role) throw new Error("Failed to save role to the db");

    return role;
  };
}

export default RoleService;
