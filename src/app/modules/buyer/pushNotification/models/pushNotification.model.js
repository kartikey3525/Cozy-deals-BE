const mongoose = require("mongoose");

const notificationHistory = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
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
