import { Request, Response } from "express";
import prisma from "../prisma/client";
import { AuthRequest } from "../middlewares/authMiddleware";
import { JwtPayload } from "jsonwebtoken";

// Update user preferences
export const updateUserPreferences = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = (req.user as JwtPayload).id;
  const { language, theme } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId, 10) },
      data: { language, theme },
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error updating user preferences", error });
  }
};

// Get user preferences
export const getUserPreferences = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = (req.user as JwtPayload).id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId, 10) },
      select: { language: true, theme: true },
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user preferences", error });
  }
};

// Get all users
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

// Update user role
export const updateUserRole = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const userId = parseInt(id, 10);
  const { role } = req.body;
  const loggedInUserId = (req as any).user.id;

  try {
    // Admin cannot remove their own admin role
    if (userId === loggedInUserId && role !== "ADMIN") {
      res
        .status(400)
        .json({ message: "Admins cannot remove their own admin access." });
      return; // exit after sending response
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error updating user role", error });
  }
};

// Delete a user
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const userId = parseInt(id, 10);

  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};
// Get user's templates
export const getUserTemplates = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = (req.user as JwtPayload).id; // Get the logged-in user ID from the token
  try {
    const templates = await prisma.template.findMany({
      where: { authorId: parseInt(userId, 10) }, // Adjust to match your database schema
    });
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user's templates", error });
  }
};
