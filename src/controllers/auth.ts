import jwt from "jsonwebtoken";
import { authenticator } from "otplib";
import { NextFunction, Request, Response } from "express";

import {
  BadRequestError,
  UnauthorizedError,
} from "../middlewares/CustomError.js";
import User from "../entity/User.js";
import AppDataSource from "../data-source.js";

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
    // TODO: after implementing two fa switch these
    // if (!email || !password || !twoFaToken)
    if (!email || !password)
      throw new BadRequestError("All fields must be filled");

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ email, password });
    if (!user) throw new UnauthorizedError("Credentials not correct");

    // TODO: after implementing two fa uncomment this
    // const twoFAValid = authenticator.verify({
    //   token: twoFaToken,
    //   secret: user.secret,
    // });
    // if (!twoFAValid) throw new UnauthorizedError("Unauthorized");

    const jwtToken = createJwt(user.id);
    if (!jwtToken) throw new Error("Creating jwt failed");

    res.status(200).json({ status: "success", data: jwtToken });
  } catch (err) {
    next(err);
  }
};

export { login };
