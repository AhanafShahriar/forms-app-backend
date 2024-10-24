import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";

export const roleMiddleware = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Return type is now just `void`
    const userRole = req.user?.role; // userRole can be string or undefined

    // Check if userRole is defined and included in the required roles
    if (!userRole || !roles.includes(userRole)) {
      res.status(403).json({ message: "Forbidden: Insufficient privileges" });
      return; // Exit the function after sending the response
    }

    next(); // Call next() if the user has the required role
  };
};
