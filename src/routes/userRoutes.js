import { Router } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getVeterinarians,
} from "../controllers/userController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/roleMiddleware.js";

const router = Router();

router.get("/", verifyToken, checkRole("admin", "veterinarian"), getUsers);

// Ruta específica para obtener veterinarios (debe ir antes de /:id)
router.get("/veterinarians/list", verifyToken, getVeterinarians);

router.get("/:id", verifyToken, getUserById);

router.post("/", verifyToken, checkRole("admin"), createUser);

router.put("/:id", verifyToken, checkRole("admin"), updateUser);

router.delete("/:id", verifyToken, checkRole("admin"), deleteUser);

export default router;
