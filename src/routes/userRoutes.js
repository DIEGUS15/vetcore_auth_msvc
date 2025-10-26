import { Router } from "express";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/roleMiddleware.js";

const router = Router();

router.get("/", verifyToken, checkRole("admin"), getUsers);

router.post("/", verifyToken, checkRole("admin"), createUser);

router.put("/:id", verifyToken, checkRole("admin"), updateUser);

router.delete("/:id", verifyToken, checkRole("admin"), deleteUser);

export default router;
