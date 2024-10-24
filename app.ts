import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import templateRoutes from "./routes/templateRoutes";

import userRoutes from "./routes/userRoutes";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/templates", templateRoutes);
app.use("/admin", userRoutes);
app.use("/user", userRoutes);

export default app;
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
