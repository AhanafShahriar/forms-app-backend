import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload as OriginalJwtPayload } from "jsonwebtoken";

interface JwtPayload extends OriginalJwtPayload {
  id: string;
  username: string;
  role: string; // Include the role in the payload
}

export interface AuthRequest extends Request {
  user?: JwtPayload; // Ensure this property is included
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log("Authorization header:", req.headers.authorization); // Debugging line

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    };
    next();
  } catch (error) {
    console.error("Token verification error:", error); // Debugging line
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: "Token expired" });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Invalid token" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
