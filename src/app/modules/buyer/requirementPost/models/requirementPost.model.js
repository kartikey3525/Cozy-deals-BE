const mongoose = require("mongoose");

const RequirementPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    categories: [String],

    images: [String],

    description: {
      type: String,
      maxlength: 1000,
    },

    contactNumber: {
      type: String,
      trim: true,
    },

    contactEmail: {
      type: String,
      trim: true,
    },

    location: {
      address: {
          type: String,
          default: "",
      },
      city: {
          type: String,
          default: "",
      },
      state: {
          type: String,
          default: "",
      },
      country: {
          type: String,
          default: "",
      },
      latitude: Number,
      longitude: Number,
  },

    locationUrl: {
      type: String,
      trim: true,
    },

    latitude: {
      type: String,
      trim: true,
    },

    longitude: {
      type: String,
      trim: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

let RequirementPost = mongoose.model("Requirementpost", RequirementPostSchema);
module.exports = { RequirementPost };
