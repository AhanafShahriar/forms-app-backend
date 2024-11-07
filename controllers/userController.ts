import { Request, Response } from "express";
import prisma from "../prisma/client";
import { AuthRequest } from "../middlewares/authMiddleware";
import { JwtPayload } from "jsonwebtoken";
import { getSalesforceAccessToken } from "../services/salesforceService";
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
//salesforce
interface SalesforceResponse {
  id: string;
}

export const createAccount = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { accountName, contactName, contactEmail } = req.body;

  try {
    const accessToken = await getSalesforceAccessToken();
    console.log("Access Token:", accessToken);

    if (!accessToken) {
      res.status(500).json({ message: "Failed to retrieve access token." });
      return;
    }

    const accountResponse = await axios.post<SalesforceResponse>(
      `${process.env.SALESFORCE_API_URL}/sobjects/Account/`,
      { Name: accountName },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const accountId = accountResponse.data?.id;
    if (!accountId) {
      res.status(500).json({ message: "Failed to create Account." });
      return;
    }

    await axios.post(
      `${process.env.SALESFORCE_API_URL}/sobjects/Contact/`,
      {
        LastName: contactName,
        Email: contactEmail,
        AccountId: accountId,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res
      .status(201)
      .json({ message: "Account and Contact created successfully!" });
  } catch (error) {
    console.error("Error creating account or contact:", error);
    res.status(500).json({ message: "Failed to create Account and Contact." });
  }
};
