// src/routes/templateRoutes.ts

import { Router } from "express";
import {
  createTemplate,
  getTemplates,
  getTemplateById,
  searchTemplates,
  getTemplateComments,
  createComment,
  editComment,
  editTemplate,
  deleteComment,
  deleteTemplate,
  getTags,
} from "../controllers/templateController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// Public routes for fetching templates and tags
router.get("/latest", getTemplates); // Remove authMiddleware
router.get("/popular", getTemplates); // Remove authMiddleware
router.get("/tags", getTags); // Remove authMiddleware

// Other protected routes
router.post("/", authMiddleware, createTemplate);
router.get("/search", searchTemplates);
router.get("/:templateId", getTemplateById);
router.get("/:templateId/comments", authMiddleware, getTemplateComments);
router.post("/:templateId/comments", authMiddleware, createComment);
router.put("/:templateId", authMiddleware, editTemplate);
router.delete("/:templateId", authMiddleware, deleteTemplate);
router.put("/:templateId/comments/:commentId", authMiddleware, editComment);
router.delete(
  "/:templateId/comments/:commentId",
  authMiddleware,
  deleteComment
);

export default router;
