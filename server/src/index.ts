import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.route";
import messageRoutes from "./routes/message.route";
dotenv.config();
const PORT = Number(process.env.PORT);

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
