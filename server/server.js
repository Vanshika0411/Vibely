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

// Connect Database
await connectDB();

// JSON parser
app.use(express.json());

// -------------------
// CORS Configuration
// -------------------
const allowedOrigins = [
  "http://localhost:5173",       // Development frontend
  "https://vibely-gilt.vercel.app" // Production frontend
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // Allow non-browser requests
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// -------------------
// Clerk Middleware
// -------------------
app.use(clerkMiddleware());

// -------------------
// Serve uploaded images
// -------------------
app.use("/uploads", express.static("uploads"));

// -------------------
// Routes
// -------------------
app.get("/", (req, res) => res.send("Server is running"));

app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/story", storyRouter);
app.use("/api/message", messageRouter);

// -------------------
// SSE Middleware Example
// -------------------
// If you are manually using SSE in messageRouter, ensure this in that route:
// res.setHeader("Access-Control-Allow-Origin", "*"); // or origin check as above
// res.setHeader("Cache-Control", "no-cache");
// res.setHeader("Connection", "keep-alive");
// res.setHeader("Content-Type", "text/event-stream");

// -------------------
// Start Server
// -------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));