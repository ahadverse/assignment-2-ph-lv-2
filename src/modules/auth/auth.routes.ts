import { Router } from "express";
import { signup, login } from "./auth.controller";

const router = Router();

// signup
router.post("/signup", signup);

// login
router.post("/login", login);

export default router;
