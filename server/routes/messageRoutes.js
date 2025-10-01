import express from "express";
import { protect } from "../middlewares/auth.js";
import multer from "multer";
import path from "path";
import { 
  sendMessage, 
  getChatMessages, 
  getUserRecentMessages, 
  sseController,
  markMessagesAsSeen  // <- add this
} from "../controllers/messageController.js";

const router = express.Router();

// Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Ensure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Routes
router.post("/send", protect, upload.single("image"), sendMessage);
router.get("/chat/:to_user_id", protect, getChatMessages);
router.get("/me", protect, getUserRecentMessages);

// 👇 SSE route pe protect hata diya, token controller me verify hoga
router.get("/sse/:userId", sseController);
router.put("/seen/:chatId", protect, markMessagesAsSeen);


export default router;
