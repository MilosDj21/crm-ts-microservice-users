import jwt, {
  JsonWebTokenError,
  JwtPayload,
  TokenExpiredError,
} from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import User from "../entity/User";
import { ForbiddenError, UnauthorizedError } from "./CustomError";
import AppDataSource from "../data-source";

declare module "express" {
  export interface Request {
    userId?: number; // Add custom property
  }
}

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const tokenHeader = req.headers["authorization"];
  const secret = process.env.JWT_SECRET;
  try {
    if (!secret) throw new Error("Jwt secret non existent");

    if (!tokenHeader)
      throw new UnauthorizedError("Unauthorized", "No token header in request");

    const token = tokenHeader.split(" ")[1];
    if (!token)
      throw new UnauthorizedError("Unauthorized", "No token header in request");

    let decoded = null;
    try {
      decoded = jwt.verify(token, secret) as JwtPayload;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedError(
          "Credentials not correct",
          "Invalid token provided",
        );
      } else if (error instanceof TokenExpiredError) {
        throw new UnauthorizedError("Session expired", "Token expired");
      } else {
        throw new UnauthorizedError("Credentials not correct");
      }
    }

    if (!decoded || !decoded.id || isNaN(parseInt(decoded.id)))
      throw new UnauthorizedError(
        "Credentials not correct",
        "User id not valid",
      );

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: decoded.id });
    if (!user)
      throw new UnauthorizedError("Credentials not correct", "User not found");

    req.userId = decoded.id;

    next();
  } catch (error) {
    next(error);
  }
};

const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.userId;
  try {
    if (!userId)
      throw new UnauthorizedError("Unauthorized", "User id non existent");

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: userId },
      relations: { roles: true },
    });
    if (!user) throw new UnauthorizedError("Unauthorized", "Invalid User");

    let isAdmin = false;
    for (const role of user.roles) {
      if (role.name === "Admin") isAdmin = true;
    }
    if (isAdmin) {
      next();
    } else {
      throw new ForbiddenError("Require admin role");
    }
  } catch (error) {
    next(error);
  }
};

export { verifyToken, isAdmin };
