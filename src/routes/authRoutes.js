import express from "express";
import { register, login } from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

export default router;
