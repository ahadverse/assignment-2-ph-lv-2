import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { sendError } from "../utils/response";

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
    sendError(res, err.statusCode, err.message, err.errors);
    return;
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    sendError(res, StatusCodes.UNAUTHORIZED, "Invalid token or expired token");
    return;
  }

  console.error(JSON.stringify(err, Object.getOwnPropertyNames(err)));

  sendError(res, StatusCodes.INTERNAL_SERVER_ERROR, "Something went wrong !!!");
};
