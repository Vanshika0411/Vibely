import User from "../models/User.js";
import { getAuth } from "@clerk/clerk-sdk-node"; // backend SDK

export const protect = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authorization.replace("Bearer ", "");

    // Clerk token verify
    let session;
    try {
      session = await getAuth(token); // ya verifyToken depending on SDK version
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const clerkUserId = session.sub; // Clerk user ID

    // MongoDB me user search
    const user = await User.findById(clerkUserId);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("AUTH ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};