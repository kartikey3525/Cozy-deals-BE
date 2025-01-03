const mongoose = require("mongoose");

const chatId = new mongoose.Schema(
  {
    userA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Chat Schema
const ChatSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChatId",
    required: true,
    unique: true, // Ensure that a chat between two users is unique.
  }, // Unique ID for one-on-one or group chat
  messages: [
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      text: String,
      timestamp: { type: Date, default: Date.now },
      seenBy: [String], // Array of user IDs who have seen the message
    },
  ],
});

const ChatId = mongoose.model("ChatId", chatId);
const Chat = mongoose.model("Chat", ChatSchema);

module.exports = { ChatId, Chat };
