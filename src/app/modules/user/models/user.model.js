const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "name" },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    userName: {
      type: String,
      trim: true,
      unique: true,
    },
    bio: {
      type: String,
      trim: true,
      default: "bio",
    },
    googleData: {},
    facebookData: {},
    phone: {
      type: String,
      trim: true,
    },
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
    roleId: {
      type: Number,
      default: 0,
    }, // 0 for student and 1 for admin
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    profession: {
      type: String,
      trim: true,
      default: "profession",
    },
    document: {},
    userType: {
      type: String,
      enum: ["blue", "grey", "green"],
      default: "blue",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "declined"],
      default: "pending",
    },
    fcmToken: {
      type: String,
    },
    adminMessage: {
      type: String,
    },
    bankAccountNumber: {
      type: String,
      trim: true,
    },
    accountHolderName: {
      type: String,
      trim: true,
    },
    bankIfscCode: {
      type: String,
      trim: true,
    },
    isDeleted: { type: Boolean, default: false },
    isDeactivated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = { User };
