import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../middlewares/CustomError";
import AppDataSource from "../data-source";
import Role from "../entity/Role";
import RoleService from "../services/role";

const saveOne = async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body;
  try {
    if (!name) throw new BadRequestError("All fields must be filled");

    const roleRepository = AppDataSource.getRepository(Role);
    const roleService = new RoleService(roleRepository);
    const role = await roleService.saveOne(name);

    res.status(200).json({ data: role, message: "Added Successfully!" });
  } catch (error) {
    next(error);
  }
};

export { saveOne };
