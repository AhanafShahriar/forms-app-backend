import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import templateRoutes from "./routes/templateRoutes";

import userRoutes from "./routes/userRoutes";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/templates", templateRoutes);
app.use("/admin", userRoutes);
app.use("/user", userRoutes);

export default app;
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
