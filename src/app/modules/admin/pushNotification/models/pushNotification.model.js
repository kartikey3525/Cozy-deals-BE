const mongoose = require("mongoose");

const notificationHistory = new mongoose.Schema({
  type: {
    type: String,
    enum: ["post", "ads", "user", "follow"], // Notification types
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
  },
  metadata: {
    type: Object,
    default: {},
  },
});

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notificationHistory: [notificationHistory],
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = { Notification };
