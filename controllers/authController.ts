import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client";

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "USER",
      },
    });
    res.status(201).json({ message: "User registered", user: newUser });
  } catch (error: any) {
    if (error.code === "P2002") {
      res.status(400).json({ message: "Email already registered" });
    } else {
      res.status(400).json({ message: "Error registering user", error });
    }
  }
};

export const login = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, // Include role in token
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h",
      }
    );

    // Include role in the response user object
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role, // Add the role here
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};
