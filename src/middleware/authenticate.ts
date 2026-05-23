import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { verifyToken } from "../utils/jwt";
import { sendError } from "../utils/response";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization;

  console.log(token, "token");

  if (!token) {
    sendError(res, StatusCodes.UNAUTHORIZED, "No token found");
    return;
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    sendError(res, StatusCodes.UNAUTHORIZED, "Invalid token or expired token");
  }
};
