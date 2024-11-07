import express from "express";
import { createJiraTicket } from "../controllers/jiraController"; // Ensure this points to the correct controller
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

// Route to create a Jira ticket
router.post("/create-ticket", authMiddleware, createJiraTicket);

// Route to get user's created tickets (to be implemented)
// router.get("/my-tickets", getUser Tickets);

export default router;
