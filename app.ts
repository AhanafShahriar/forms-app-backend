// server.ts

import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import "express-session";

// Make sure to install express-session
import authRoutes from "./routes/authRoutes";
import templateRoutes from "./routes/templateRoutes";
import formRoutes from "./routes/formRoutes";
import userRoutes from "./routes/userRoutes";
import ticketRoutes from "./routes/ticketRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/templates", templateRoutes);
app.use("/forms", formRoutes);
// app.use("/admin", userRoutes);
app.use("/user", userRoutes);
app.use("/api/tickets", ticketRoutes);
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
