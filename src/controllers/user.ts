import { NextFunction, Request, Response } from "express";

import { BadRequestError } from "../middlewares/CustomError";
import UserService from "../services/user";
import AppDataSource from "../data-source";
import User from "../entity/User";
import Role from "../entity/Role";

declare module "express" {
  export interface Request {
    file?: Express.Multer.File;
  }
}

const saveOne = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, firstName, lastName, roleIds } = req.body;
  const profileImage = req.file;
  try {
    if (!email || !password || !firstName || !lastName || !roleIds)
      throw new BadRequestError("All fields must be filled");

    const userRepository = AppDataSource.getRepository(User);
    const roleRepository = AppDataSource.getRepository(Role);
    const userService = new UserService(userRepository, roleRepository);
    const imageQr = await userService.saveOne(
      email,
      password,
      firstName,
      lastName,
      profileImage ? profileImage.path : "",
      roleIds,
    );

    res.status(200).json({
      data: imageQr,
      message: "Added Successfully!",
    });
  } catch (err) {
    next(err);
  }
};

export { saveOne };
