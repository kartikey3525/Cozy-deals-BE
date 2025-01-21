const mongoose = require("mongoose");

const messageData = new mongoose.Schema({
  senderId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    trim: true,
  },
  msg: {
    type: String,
    trim: true,
    default: "",
  },
  msgType: {
    type: String,
    enum: [
      "text",
      "image",
      "sound",
      "audioCall",
      "videoCall",
      "link",
      "video",
      "pdf",
      "otherText",
    ],
    default: "text",
  },
  thumbnail: {
    type: String,
    trim: true,
    default: "",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const ChatSupportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      trim: true,
      required: true,
    },
    message: [messageData],
  },
  { timestamps: true }
);

const ChatSupport = mongoose.model("ChatSupport", ChatSupportSchema);

module.exports = { ChatSupport };
