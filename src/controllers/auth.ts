import jwt from "jsonwebtoken";
import { authenticator } from "otplib";
import { NextFunction, Request, Response } from "express";
import { BadRequestError, UnauthorizedError } from "../middlewares/CustomError";

import User from "../entity/User";
import AppDataSource from "../data-source";

const createJwt = (id: number) => {
  //3 days in seconds
  const maxAge = 3 * 24 * 60 * 60;
  const secret = process.env.JWT_SECRET;
  if (secret) {
    return jwt.sign({ id }, secret, {
      expiresIn: maxAge,
    });
  } else {
    return null;
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, twoFaToken } = req.body;
  try {
    if (!email || !password || !twoFaToken)
      throw new BadRequestError("All fields must be filled");

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ email, password });
    if (!user) throw new UnauthorizedError("Unauthorized");

    const twoFAValid = authenticator.verify({
      token: twoFaToken,
      secret: user.secret,
    });
    if (!twoFAValid) throw new UnauthorizedError("Unauthorized");

    const jwtToken = createJwt(user.id);
    if (!jwtToken) throw new Error("Error creating token");

    res.status(200).json({ status: "success", data: jwtToken });
  } catch (err: any) {
    next(err);
  }
};

export { login };
