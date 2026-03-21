import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    from_user_id: { type: mongoose.Schema.Types.String, ref: "User", required: true },
    to_user_id:   { type: mongoose.Schema.Types.String, ref: "User", required: true },
    text:         { type: String },
    message_type: { type: String, enum: ["text", "image"], default: "text" },
    media_url:    { type: String },
    seen:         { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
