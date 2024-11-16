import { Request, Response, NextFunction } from "express";
import { CustomError } from "./CustomError.js";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(err);
  if (err instanceof CustomError) {
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  // Handle unexpected errors
  console.error("Unexpected error:", err);
  res.status(500).json({
    error: "Internal Server Error",
  });
  return;
};
