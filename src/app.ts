import path from "path";
import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import issuesRoutes from "./modules/issues/issues.routes";
import { errorHandler } from "./middleware/errorHandler";
import { sendError } from "./utils/response";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "utils", "landing.html"));
});

app.get("/download/postman", (_req, res) => {
  const file = path.join(__dirname, "..", "DevPulse.postman_collection.json");
  res.download(file, "DevPulse.postman_collection.json");
});

app.use("/api/auth", authRoutes);
app.use("/api/issues", issuesRoutes);

app.use((_req, res) => {
  sendError(res, 404, "Route not found");
});

app.use(errorHandler);

export default app;
