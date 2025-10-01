import imagekit from "../configs/imageKit.js";
import fs from "fs";
import Story from "../models/Story.js";
import User from "../models/User.js";
import { inngest } from "../inngest/index.js";

export const addUserStory = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { content, media_type, background_color } = req.body;
    const media = req.file; // ye image/video ho sakta hai
    let media_url = "";

    // ✅ Agar media file hai (image ya video)
    if (media && (media_type === "image" || media_type === "video")) {
      const fileBuffer = fs.readFileSync(media.path);
      const response = await imagekit.upload({
        file: fileBuffer,
        fileName: media.originalname,
      });
      media_url = response.url;
    }

    // ✅ Story create karo
    const story = await Story.create({
      user: userId,
      content: content || "", // agar sirf image/video hai to content optional
      media_url,
      media_type: media_type || "text", // default agar kuch nahi aaya to text
      background_color: background_color || null,
    });

    // ✅ Auto delete after expiry (e.g., 24h) - Inngest event
    await inngest.send({
      name: "app/story.delete",
      data: { storyId: story._id },
    });

    res.json({ success: true, story });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export const getStories = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findById(userId);

    const userIds = [userId, ...user.connections, ...user.following];

    // ✅ Saare stories fetch + user populate
    const stories = await Story.find({
      user: { $in: userIds },
    })
      .populate("user")
      .sort({ createdAt: -1 });

    res.json({ success: true, stories });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
