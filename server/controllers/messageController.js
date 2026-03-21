import Message from "../models/Message.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const sendMessage = async (req, res) => {
  try {
    const from_user_id = req.user._id;
    const { to_user_id, text } = req.body;

    const newMessage = new Message({
      from_user_id,
      to_user_id,
      text,
      message_type: req.file ? "image" : "text",
      media_url: req.file ? `/uploads/${req.file.filename}` : null,
    });

    await newMessage.save();

    res.status(201).json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get chat messages between 2 users
export const getChatMessages = async (req, res) => {
  try {
    const from_user_id = req.user._id;
    const { to_user_id } = req.params;

    const messages = await Message.find({
      $or: [
        { from_user_id, to_user_id },
        { from_user_id: to_user_id, to_user_id: from_user_id },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserRecentMessages = async (req, res) => {
  try {
    const userId = req.user._id;

    const recentMessages = await Message.find({
      $or: [{ from_user_id: userId }, { to_user_id: userId }],
    })
      .sort({ updatedAt: -1 })
      .limit(20)
      .populate("from_user_id", "full_name profile_picture")
      .populate("to_user_id", "full_name profile_picture");

    res.status(200).json({ success: true, messages: recentMessages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// SSE for real-time messages
export const sseController = (req, res) => {
  try {
    const token = req.query.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const userId = decoded.id || decoded._id; // jwt payload me jo bhi field hai

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.write("event: ping\n");
    res.write("data: connected\n\n");

    const interval = setInterval(async () => {
      try {
        const lastMessage = await Message.findOne({
          $or: [{ to_user_id: userId }, { from_user_id: userId }],
        })
          .sort({ createdAt: -1 })
          .populate("from_user_id", "full_name profile_picture");

        if (lastMessage) {
          res.write(`data: ${JSON.stringify(lastMessage)}\n\n`);
        }
      } catch (err) {
        console.error("SSE fetch error:", err);
      }
    }, 2000);

    req.on("close", () => clearInterval(interval));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const markMessagesAsSeen = async (req, res) => {
  try {
    const currentUserId = req.user._id;  // logged-in user
    const otherUserId = req.params.chatId; // jis user ke saath chat hai

    await Message.updateMany(
      { from_user_id: otherUserId, to_user_id: currentUserId, seen: false },
      { $set: { seen: true } }
    );

    res.status(200).json({ success: true, message: "Messages marked as seen" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


