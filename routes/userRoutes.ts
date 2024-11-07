import express from "express";
import {
  getUserTemplates,
  getAllUsers,
  updateUserRole,
  deleteUser,
  createAccount,
} from "../controllers/userController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware";
import { getFilledFormsByUserId } from "../controllers/formController";
import {
  updateUserPreferences,
  getUserPreferences,
} from "../controllers/userController";

const router = express.Router();

router.post("/accounts", authMiddleware, createAccount);
router.get("/forms", authMiddleware, getFilledFormsByUserId);

router.get("/templates", authMiddleware, getUserTemplates);

router.get("/users", authMiddleware, getAllUsers);
router.patch("/preferences", authMiddleware, updateUserPreferences);
router.get("/preferences", authMiddleware, getUserPreferences);

router.patch(
  "/:id/role",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  updateUserRole
);

router.delete("/:id", authMiddleware, roleMiddleware(["ADMIN"]), deleteUser);

export default router;
