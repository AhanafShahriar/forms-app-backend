import { Router } from "express";
import {
  createForm,
  getFilledFormsByTemplateId,
  getFilledFormsByUserId,
  deleteForm,
} from "../controllers/formController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
router.get("/user/forms", authMiddleware, getFilledFormsByUserId);
// Route to create a filled form
router.post("/", authMiddleware, createForm);

// Route to get filled forms by template ID
router.get("/template/:templateId", authMiddleware, getFilledFormsByTemplateId);

// Route to delete a filled form
router.delete("/:id", authMiddleware, deleteForm);

export default router;
