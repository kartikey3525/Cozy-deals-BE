const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    id: { type: String, trim: true },
    referralCode: { type: String, trim: true }, // id
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
    gender:{
      type: String,
      enum: ["male", "female", "other"],
      default: "male",
      trim: true,
    },
    dob:{
      type: Date
    },
    // use,rName: {
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
    address: {
      type: String,
      trim: true,
    },
    latitude: {
      // location latitude
      type: String,
      trim: true,
    },
    longitude: {
      // location longitude
      type: String,
      trim: true,
    },
    forgotPassword: {
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

    openTime:{
      type: Date,
    },
    closeTime:{
      type: Date,
    },
    lastSeen: {
      type: Date,
    }, // Timestamp of the user's last activity
    isOnline: {
      type: Boolean,
      default: false,
    }, // Indicates if the user is currently online
    socketId: {
      type: String,
      trim: true,
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
    currentShopLocationUrl: {
      type: String,
      trim: true,
    },
    pushNotification: {
      type: Boolean,
      default: false,
    },
    smsNotification: {
      type: Boolean,
      default: false,
    },
    emailNotification: {
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

UserSchema.pre("save", async function (next) {
  const user = this;
  console.log("============id");
  if (user.roleId === 0 && !user.id) {
    try {
      const lastStudent = await mongoose
        .model("User")
        .findOne({ roleId: 0 })
        .sort({ createdAt: -1 });

      let newId = "BU0001";

      if (lastStudent && lastStudent.id) {
        const lastIdNum = parseInt(lastStudent.id.replace("BU", ""));
        const nextIdNum = lastIdNum + 1;

        newId = `BU${nextIdNum.toString().padStart(4, "0")}`;
      }

      user.id = newId;
      next();
    } catch (err) {
      next(err);
    }
  } else if (user.roleId === 1 && !user.id) {
    try {
      const lastStudent = await mongoose
        .model("User")
        .findOne({ roleId: 1 })
        .sort({ createdAt: -1 });

      let newId = "SE0001";

      if (lastStudent && lastStudent.id) {
        const lastIdNum = parseInt(lastStudent.id.replace("SE", ""));
        const nextIdNum = lastIdNum + 1;

        newId = `SE${nextIdNum.toString().padStart(4, "0")}`;
      }

      user.id = newId;
      next();
    } catch (err) {
      next(err);
    }
  } else if (user.roleId === 2 && !user.id) {
    try {
      const lastStudent = await mongoose
        .model("User")
        .findOne({ roleId: 2 })
        .sort({ createdAt: -1 });

      let newId = "AD0001";

      if (lastStudent && lastStudent.id) {
        const lastIdNum = parseInt(lastStudent.id.replace("AD", ""));
        const nextIdNum = lastIdNum + 1;

        newId = `AD${nextIdNum.toString().padStart(4, "0")}`;
      }

      user.id = newId;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

const User = mongoose.model("User", UserSchema);
module.exports = { User };
