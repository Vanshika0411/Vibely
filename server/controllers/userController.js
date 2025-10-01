import User from "../models/User.js";
import Connection from "../models/Connection.js";
import Post from "../models/Post.js";
import imagekit from "../configs/imageKit.js";
import fs from "fs";
import { inngest } from "../inngest/index.js";

export const getUserData = async (req, res) => {
  try {
    const userId = req.user._id; // req.user set by protect
    const user = await User.findById(userId);
    if (!user) return res.json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update user data
export const updateUserData = async (req, res) => {
  try {
    const userId = req.user._id;
    let { username, bio, location, full_name } = req.body;

    const tempUser = await User.findById(userId);
    if (!username) username = tempUser.username;

    if (tempUser.username !== username) {
      const userExists = await User.findOne({ username });
      if (userExists) username = tempUser.username;
    }

    const updatedData = { username, bio, location, full_name };

    const profile = req.files?.profile?.[0];
    const cover = req.files?.cover?.[0];

    if (profile) {
      const buffer = fs.readFileSync(profile.path);
      const response = await imagekit.upload({ file: buffer, fileName: profile.originalname });
      updatedData.profile_picture = imagekit.url({
        path: response.filePath,
        transformation: [{ quality: "auto" }, { format: "webp" }, { width: 512 }],
      });
    }

    if (cover) {
      const buffer = fs.readFileSync(cover.path);
      const response = await imagekit.upload({ file: buffer, fileName: cover.originalname });
      updatedData.cover_photo = imagekit.url({
        path: response.filePath,
        transformation: [{ quality: "auto" }, { format: "webp" }, { width: 1280 }],
      });
    }

    const user = await User.findByIdAndUpdate(userId, updatedData, { new: true });
    res.json({ success: true, user, message: "Profile updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get user connections
export const getUserConnections = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("connections followers following");

    const pendingConnections = (
      await Connection.find({ to_user_id: userId, status: "pending" }).populate("from_user_id")
    ).map(conn => conn.from_user_id);

    res.json({
      success: true,
      connections: user.connections,
      followers: user.followers,
      following: user.following,
      pendingConnections,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Discover users
export const discoverUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const { input } = req.body;

    const allUsers = await User.find({
      $or: [
        { username: new RegExp(input, "i") },
        { email: new RegExp(input, "i") },
        { full_name: new RegExp(input, "i") },
        { location: new RegExp(input, "i") },
      ],
    });

    const filteredUsers = allUsers.filter(u => u._id.toString() !== userId.toString());
    res.json({ success: true, users: filteredUsers });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Follow user
export const followUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.body;

    const user = await User.findById(userId);
    if (user.following.includes(id)) return res.json({ success: false, message: "Already following" });

    user.following.push(id);
    await user.save();

    const toUser = await User.findById(id);
    toUser.followers.push(userId);
    await toUser.save();

    res.json({ success: true, message: "Now following this user" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Unfollow user
export const unfollowUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.body;

    const user = await User.findById(userId);
    user.following = user.following.filter(f => f.toString() !== id);
    await user.save();

    const toUser = await User.findById(id);
    toUser.followers = toUser.followers.filter(f => f.toString() !== userId.toString());
    await toUser.save();

    res.json({ success: true, message: "Unfollowed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Send connection request
export const sendConnectionRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.body;

    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const requests = await Connection.find({ from_user_id: userId, created_at: { $gt: last24Hours } });
    if (requests.length >= 20) return res.json({ success: false, message: "More than 20 requests in 24h" });

    let connection = await Connection.findOne({
      $or: [
        { from_user_id: userId, to_user_id: id },
        { from_user_id: id, to_user_id: userId },
      ],
    });

    if (!connection) {
      connection = await Connection.create({ from_user_id: userId, to_user_id: id });
      await inngest.send({ name: "app/connection-request", data: { connectionId: connection._id } });
      return res.json({ success: true, message: "Connection request sent" });
    }

    if (connection.status === "accepted") return res.json({ success: false, message: "Already connected" });

    res.json({ success: false, message: "Request pending" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Accept connection request
export const acceptConnectionRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.body;

    const connection = await Connection.findOne({ from_user_id: id, to_user_id: userId });
    if (!connection) return res.json({ success: false, message: "Connection not found" });

    const user = await User.findById(userId);
    user.connections.push(id);
    await user.save();

    const toUser = await User.findById(id);
    toUser.connections.push(userId);
    await toUser.save();

    connection.status = "accepted";
    await connection.save();

    res.json({ success: true, message: "Connection accepted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get user profiles with posts
export const getUserProfiles = async (req, res) => {
  try {
    const { profileId } = req.body;
    const profile = await User.findById(profileId);
    if (!profile) return res.json({ success: false, message: "Profile not found" });

    const posts = await Post.find({ user: profileId }).populate("user");
    res.json({ success: true, profile, posts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
