// import User from "../models/User.js";

// export const protect = async (req, res, next) => {
//   try {
//     const { userId } = await req.auth();
//     if (!userId) {
//       return res.status(401).json({ success: false, message: "Not authenticated" });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(401).json({ success: false, message: "User not found" });
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     console.log("AUTH ERROR:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };



import { clerkClient } from "@clerk/express";

export const protect = async (req, res, next) => {
  try {
    const authData = req.auth();

    if (!authData || !authData.userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const userId = authData.userId;

    // ✅ Clerk se full user data lao
    const clerkUser = await clerkClient.users.getUser(userId);

    req.user = {
      _id: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      full_name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`,
    };

    next();

  } catch (error) {
    console.log("AUTH ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};