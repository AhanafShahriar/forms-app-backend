import express from "express";
import {
  getUserTemplates,
  getAllUsers,
  updateUserRole,
  deleteUser,
} from "../controllers/userController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware"; // Correct middleware import
import { getFilledFormsByUserId } from "../controllers/formController";
import {
  updateUserPreferences,
  getUserPreferences,
} from "../controllers/userController";

const router = express.Router();
// Route to get user's filled forms
router.get("/forms", authMiddleware, getFilledFormsByUserId);
// Route to get user's templates
router.get("/templates", authMiddleware, getUserTemplates); // Add this line
// Get all users (admin only)
router.get("/users", authMiddleware, getAllUsers); // Using roleMiddleware for role check
router.patch("/preferences", authMiddleware, updateUserPreferences);
router.get("/preferences", authMiddleware, getUserPreferences);
// Update user role (admin only)
router.patch(
  "/:id/role",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  updateUserRole
);

// Delete user (admin only)
router.delete("/:id", authMiddleware, roleMiddleware(["ADMIN"]), deleteUser);

export default router;
