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

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination (admin only)
 * @access  Private (Admin)
 * @query   page - Page number (default: 1)
 * @query   limit - Users per page (default: 10, max: 100)
 */
router.get("/", verifyToken, checkRole("admin"), getUsers);

/**
 * @route   POST /api/users
 * @desc    Create a new user (admin only)
 * @access  Private (Admin)
 * @body    fullname, telephone, address, email, password, roleName, isActive
 */
router.post("/", verifyToken, checkRole("admin"), createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user by ID (admin only)
 * @access  Private (Admin)
 * @body    fullname, telephone, address, email, password, roleName, isActive
 */
router.put("/:id", verifyToken, checkRole("admin"), updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Soft delete user (set isActive to false) (admin only)
 * @access  Private (Admin)
 */
router.delete("/:id", verifyToken, checkRole("admin"), deleteUser);

export default router;
