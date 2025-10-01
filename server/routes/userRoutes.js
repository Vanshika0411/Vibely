import express from "express";
import { protect } from "../middlewares/auth.js";
import { upload } from "../configs/multer.js";
import {
  getUserData,
  getUserConnections,
  getUserProfiles,
  updateUserData,
  discoverUsers,
  followUser,
  unfollowUser,
  sendConnectionRequest,
  acceptConnectionRequest
} from "../controllers/userController.js";

const router = express.Router();

// Get current user data
router.get("/data", protect, getUserData);

// Get current user connections
router.get("/connections", protect, getUserConnections);

// Discover people 🔥
router.post("/discover", protect, discoverUsers);

// Follow / Unfollow
router.post("/follow", protect, followUser);
router.post("/unfollow", protect, unfollowUser);

// Connection requests
router.post("/connect", protect, sendConnectionRequest);
router.post("/accept", protect, acceptConnectionRequest);

// Get another user's profile & posts
router.post("/profiles", protect, getUserProfiles);

// Update profile (text + images)
router.put(
  "/update",
  protect,
  upload.fields([
    { name: "profile", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  updateUserData
);

export default router;


