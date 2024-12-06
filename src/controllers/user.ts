import { NextFunction, Request, Response } from "express";

import { BadRequestError } from "../middlewares/CustomError";
import UserService from "../services/user";
import AppDataSource from "../data-source";
import User from "../entity/User";

declare module "express" {
  export interface Request {
    file?: Express.Multer.File;
  }
}

const saveOne = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, firstName, lastName } = req.body;
  const profileImage = req.file;
  try {
    if (!email || !password || !firstName || !lastName)
      throw new BadRequestError("All fields must be filled");

    const userRepository = AppDataSource.getRepository(User);
    const userService = new UserService(userRepository);
    const imageQr = await userService.saveOne(
      email,
      password,
      firstName,
      lastName,
      profileImage ? profileImage.path : "",
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
