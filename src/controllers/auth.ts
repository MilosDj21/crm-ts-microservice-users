import { authenticator } from "otplib";
import { NextFunction, Request, Response } from "express";

import { BadRequestError } from "../middlewares/CustomError.js";
import userService from "../services/auth.js";

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, twoFaToken } = req.body;
  try {
    // TODO: after implementing two fa switch these
    // if (!email || !password || !twoFaToken)
    if (!email || !password)
      throw new BadRequestError("All fields must be filled");

    const jwtToken = userService.login(email, password);

    res.status(200).json({ data: jwtToken });
  } catch (err) {
    next(err);
  }
};

export { login };
