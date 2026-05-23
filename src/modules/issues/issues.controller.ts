import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import {
  createIssue,
  getAllIssues,
  getIssueById,
  getIssueRawById,
  updateIssue,
  deleteIssue,
} from "./issues.service";
import { sendSuccess } from "../../utils/response";
import { AppError } from "../../middleware/errorHandler";
import { CreateIssueBody, UpdateIssueBody, GetIssuesQuery } from "../../types";

export const createIssueHandler = async (
  req: Request<object, object, CreateIssueBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description, type } = req.body;

    if (!title || !description || !type) {
      throw new AppError("Title, description and type are required", StatusCodes.BAD_REQUEST);
    }
    if (title.length > 150) {
      throw new AppError("Title must not exceed 150 characters", StatusCodes.BAD_REQUEST);
    }
    if (description.length < 20) {
      throw new AppError("Description must be at least 20 characters", StatusCodes.BAD_REQUEST);
    }
    if (!["bug", "feature_request"].includes(type)) {
      throw new AppError("Type must be bug or feature_request", StatusCodes.BAD_REQUEST);
    }

    const issue = await createIssue({ title, description, type, reporter_id: req.user!.id });
    sendSuccess(res, StatusCodes.CREATED, "Issue created successfully", issue);
  } catch (err) {
    next(err);
  }
};

export const getAllIssuesHandler = async (
  req: Request<object, object, object, GetIssuesQuery>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sort, type, status } = req.query;

    if (sort && !["newest", "oldest"].includes(sort)) {
      throw new AppError("sort must be newest or oldest", StatusCodes.BAD_REQUEST);
    }
    if (type && !["bug", "feature_request"].includes(type)) {
      throw new AppError("type must be bug or feature_request", StatusCodes.BAD_REQUEST);
    }
    if (status && !["open", "in_progress", "resolved"].includes(status)) {
      throw new AppError("status must be open, in_progress or resolved", StatusCodes.BAD_REQUEST);
    }

    const issues = await getAllIssues({ sort, type, status });
    res.status(StatusCodes.OK).json({ success: true, data: issues });
  } catch (err) {
    next(err);
  }
};

export const getSingleIssueHandler = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError("Invalid ID", StatusCodes.BAD_REQUEST);

    const issue = await getIssueById(id);
    if (!issue) throw new AppError("Issue not found", StatusCodes.NOT_FOUND);

    res.status(StatusCodes.OK).json({ success: true, data: issue });
  } catch (err) {
    next(err);
  }
};

export const updateIssueHandler = async (
  req: Request<{ id: string }, object, UpdateIssueBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError("Invalid ID", StatusCodes.BAD_REQUEST);

    const existing = await getIssueRawById(id);
    if (!existing) throw new AppError("Issue not found", StatusCodes.NOT_FOUND);

    const user = req.user!;

    if (user.role === "contributor") {
      if (existing.reporter_id !== user.id) {
        throw new AppError("You can only update your own issues", StatusCodes.FORBIDDEN);
      }
      if (existing.status !== "open") {
        throw new AppError("You can only edit issues that are already open", StatusCodes.CONFLICT);
      }
      if (req.body.status !== undefined) {
        throw new AppError("Contributors can not change issue status", StatusCodes.FORBIDDEN);
      }
    }

    const { title, description, type, status } = req.body;

    if (title !== undefined && title.length > 150) {
      throw new AppError("Title must not exceed 150 characters", StatusCodes.BAD_REQUEST);
    }
    if (description !== undefined && description.length < 20) {
      throw new AppError("Description must be at least 20 characters", StatusCodes.BAD_REQUEST);
    }
    if (type !== undefined && !["bug", "feature_request"].includes(type)) {
      throw new AppError("Type must be bug or feature_request", StatusCodes.BAD_REQUEST);
    }
    if (status !== undefined && !["open", "in_progress", "resolved"].includes(status)) {
      throw new AppError("Status must be open, in_progress or resolved", StatusCodes.BAD_REQUEST);
    }

    const updated = await updateIssue(id, { title, description, type, status });
    sendSuccess(res, StatusCodes.OK, "Issue updated successfully", updated);
  } catch (err) {
    next(err);
  }
};

export const deleteIssueHandler = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError("Invalid ID", StatusCodes.BAD_REQUEST);

    const deleted = await deleteIssue(id);
    if (!deleted) throw new AppError("Issue not found", StatusCodes.NOT_FOUND);

    sendSuccess(res, StatusCodes.OK, "Issue deleted successfully");
  } catch (err) {
    next(err);
  }
};
