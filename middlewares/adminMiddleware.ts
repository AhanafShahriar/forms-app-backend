import { Request, Response, NextFunction } from "express";

// Middleware to check if user is an admin
export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = (req as Request & { user?: { role?: string } }).user;

  if (!user || user.role !== "ADMIN") {
    res.status(403).json({ message: "Forbidden: Admin access required" });
    return;
  }

  next();
};
