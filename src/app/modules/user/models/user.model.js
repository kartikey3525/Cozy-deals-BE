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
    // for seller
    shopName: { type: String, trim: true },
    ownerName: { type: String, trim: true },
    businessAddress: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pinCode: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    businessScale: {
      type: String,
      enum: ["small", "medium", "large"], //Small Business (Local)
      //Medium Business (City-wide)
      //Large Business (Multiple Cities/State-wide)
      default: "small",
    },
    isDeliveryAvailable: {
      type: Boolean,
      default: false,
    },
    contactNumber: { type: String, trim: true },
    contactEmail: { type: String, trim: true },
    description: { type: String, trim: true },
    facebookUrl: { type: String, trim: true },
    instagramUrl: { type: String, trim: true },
    youtubeUrl: { type: String, trim: true },
    websiteUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = { User };

// urpose: Allow sellers to receive relevant product requests.
// Fields in Seller Profile:
// 1. Shop Name
// 2. Owner Name
// 3. Contact Number
// 4. Email Address
// 5. Business Address
// 6. Business Scale (optional)
// Small Business (Local)
// • Medium Business (City-wide)
// • Large Business (Multiple Cities/State-wide)
// • Delivery Available: Yes/No toggle (optional)
// • description
// 7. Profile Picture (optional).
// 8. Social media(optional)
// • Location: Seller’s shop location (GPS or manual)
// • when profile is done add “more categories option”
