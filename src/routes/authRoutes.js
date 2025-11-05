import express from "express";
import {
  register,
  login,
  verifyToken,
  changePassword,
} from "../controllers/authController.js";
import { verifyToken as verifyTokenMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Rutas públicas
router.post("/register", register);
router.post("/login", login);

// Rutas protegidas
router.get("/verify", verifyTokenMiddleware, verifyToken);
router.post("/change-password", verifyTokenMiddleware, changePassword);

export default router;
