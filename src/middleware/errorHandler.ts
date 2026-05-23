import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

export class AppError extends Error {
  statusCode: number;
  errors?: unknown;

  constructor(message: string, statusCode: number, errors?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors !== undefined && { errors: err.errors }),
    });
    return;
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: "Invalid token or expired token",
    });
    return;
  }

  console.error(JSON.stringify(err, Object.getOwnPropertyNames(err)));

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Something went wrong!!!",
  });
};
