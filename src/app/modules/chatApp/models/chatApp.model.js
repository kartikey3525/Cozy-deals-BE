const mongoose = require("mongoose");

let readSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    trim: true,
  },
  status: {
    type: String,
    trim: true,
    enum: ["delivered", "read"],
    default: "read",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

let deleteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

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
    ],
    default: "text",
    required: true,
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
  readBy: [readSchema], // Tracks who read the message
  deleteBy: [deleteSchema],
});

const MessageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Types.ObjectId,
      ref: "Chatcontact",
      trim: true,
    },
    message: [messageData],
  },
  { timestamps: true }
);

const ChatApp = mongoose.model("Chatmessage", MessageSchema);

module.exports = { ChatApp };
