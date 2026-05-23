import { Router } from "express";
import {
  createIssueHandler,
  getAllIssuesHandler,
  getSingleIssueHandler,
  updateIssueHandler,
  deleteIssueHandler,
} from "./issues.controller";
import { authenticate } from "../../middleware/authenticate";
import { requireRole } from "../../middleware/requireRole";

const router = Router();

// all issues
router.get("/", getAllIssuesHandler);

// detail issue
router.get("/:id", getSingleIssueHandler);

// create
router.post("/", authenticate, createIssueHandler);

// update
router.patch("/:id", authenticate, updateIssueHandler);

// delete
router.delete(
  "/:id",
  authenticate,
  requireRole("maintainer"),
  deleteIssueHandler,
);

export default router;
