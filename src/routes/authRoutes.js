import express from "express";
import { register, login, verifyToken } from "../controllers/authController.js";
import { verifyToken as verifyTokenMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Rutas públicas
router.post("/register", register);
router.post("/login", login);

// Ruta protegida para verificar el token
router.get("/verify", verifyTokenMiddleware, verifyToken);

export default router;
