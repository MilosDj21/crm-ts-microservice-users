import jwt from "jsonwebtoken";

import User from "../entity/User.js";
import AppDataSource from "../data-source.js";
import { UnauthorizedError } from "../middlewares/CustomError.js";

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

const login = async (email: string, password: string) => {
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
};

export default { login };
