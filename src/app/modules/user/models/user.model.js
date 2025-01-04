const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "name" },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      // unique: true,
    },
    phone: {
      type: String,
      trim: true,
      // unique: true,
    },
    // userName: {
    //   type: String,
    //   trim: true,
    //   unique: true,
    // },
    googleData: {},
    profile: {
      type: String,
      trim: true,
      default:
        "https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    password: {
      type: String,
      trim: true,
    },
    otp: {
      type: String,
      trim: true,
    },
    otpDate: {
      type: Date,
    },
    countryCode: {
      type: Number,
      default: 91,
    },
    roleId: {
      type: Number,
      default: 0,
    }, // 0 for buyer, 1 for seller, 2 for admin
    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: "buyer",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAdminVerified: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },
    fcmToken: {
      type: String,
    },
    lastSeen: {
      type: Date,
    }, // Timestamp of the user's last activity
    isOnline: {
      type: Boolean,
      default: false,
    }, // Indicates if the user is currently online
    isAcceptTermConditions: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isDeactivated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = { User };
