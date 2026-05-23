import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { findUserByEmail, createUser } from "./auth.service";
import { signToken } from "../../utils/jwt";
import { sendSuccess } from "../../utils/response";
import { AppError } from "../../middleware/errorHandler";
import { SignupBody, LoginBody } from "../../types";

const SALT_ROUNDS = 10;

export const signup = async (
  req: Request<object, object, SignupBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      throw new AppError(
        "Name, email and password are required",
        StatusCodes.BAD_REQUEST,
      );
    }

    if (role && !["contributor", "maintainer"].includes(role)) {
      throw new AppError(
        "Role must be contributor or maintainer",
        StatusCodes.BAD_REQUEST,
      );
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      throw new AppError("Email already in use", StatusCodes.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await createUser({ name, email, hashedPassword, role });

    sendSuccess(res, StatusCodes.CREATED, "User registered successfuly", user);
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request<object, object, LoginBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(
        "Email and password are required",
        StatusCodes.BAD_REQUEST,
      );
    }

    const user = await findUserByEmail(email);
    if (!user) {
      throw new AppError("Invalid email or password", StatusCodes.UNAUTHORIZED);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError("Invalid email or password", StatusCodes.UNAUTHORIZED);
    }

    const token = signToken({ id: user.id, name: user.name, role: user.role });

    const { password: _, ...publicUser } = user;

    sendSuccess(res, StatusCodes.OK, "Login successful", {
      token,
      user: publicUser,
    });
  } catch (err) {
    next(err);
  }
};
