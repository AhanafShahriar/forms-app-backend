import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware";
import {
  getAllUsers,
  deleteUser,
  updateUserRole,
} from "../controllers/userController";

const router = Router();

// Get all users
router.get("/users", authMiddleware, getAllUsers);

// Delete a user
router.delete(
  "/user/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  deleteUser
);

// Update user role
router.patch(
  "/user/:id/role",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  updateUserRole
);

export default router;
