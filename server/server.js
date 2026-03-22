// server.js
import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import postRouter from "./routes/postRoutes.js";
import storyRouter from "./routes/storyRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { clerkMiddleware } from "@clerk/express";

const app = express();

await connectDB();

// ✅ Middlewares
app.use(express.json());

// ✅ CORS with credentials
app.use(cors({
  origin: "http://localhost:5173", // React dev server URL
  credentials: true
}));

// ✅ Clerk middleware for protected routes
app.use(clerkMiddleware());

// ✅ Serve uploaded images
app.use("/uploads", express.static("uploads"));

// ✅ Test route
app.get("/", (req, res) => res.send("Server is running"));

// ✅ SSE route (skip Clerk for dev)
app.get("/api/message/sse/:userId", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const interval = setInterval(() => {
    res.write(`data: ${JSON.stringify({ message: "Hello from server" })}\n\n`);
  }, 5000);

  req.on('close', () => clearInterval(interval));
});

// ✅ API routes
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/story", storyRouter);
app.use("/api/message", messageRouter);

// ✅ Server start
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));