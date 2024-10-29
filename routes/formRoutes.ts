import { Router } from "express";
import {
  createForm,
  getFilledFormsByTemplateId,
  getFilledFormById,
  getFilledFormsByUserId,
  deleteForm,
  updateForm,
} from "../controllers/formController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// Route to get filled forms by user ID
router.get("/user/forms", authMiddleware, getFilledFormsByUserId);
router.get("/:id", authMiddleware, getFilledFormById);

// Route to create a filled form
router.post("/", authMiddleware, createForm);
router.put("/:id", authMiddleware, updateForm);
// Route to get filled forms by template ID
router.get("/template/:templateId", authMiddleware, getFilledFormsByTemplateId);

// Route to delete a filled form
router.delete("/:id", authMiddleware, deleteForm);

export default router;
