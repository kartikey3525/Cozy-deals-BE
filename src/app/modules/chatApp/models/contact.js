const mongoose = require("mongoose");

let participantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    trim: true,
  },
  role: {
    type: String,
    trim: true,
    enum: ["admin", "member"],
    default: "member",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const contactSchema = new mongoose.Schema(
  {
    chatType: {
      type: String,
      enum: ["single", "group"],
      default: "single",
      trim: true,
    },
    user1: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      trim: true,
    },
    user2: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      trim: true,
    },
    participants: [participantSchema],
    groupName: {
      type: String,
      trim: true,
    },
    profile: {
      type: String,
      trim: true,
    },
    about: {
      type: String,
      trim: true,
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "private",
      trim: true,
    },
    inviteOnly: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

const ChatContact = mongoose.model("Chatcontact", contactSchema);
module.exports = { ChatContact };
