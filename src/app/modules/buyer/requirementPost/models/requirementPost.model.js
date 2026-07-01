const mongoose = require("mongoose");

const RequirementPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    categories: [String],
    images: [String],
    description: {
      type: String,
      maxlength: 1000, // Limit description length
    },
    contactNumber: { type: String, trim: true },
    contactEmail: { type: String, trim: true },
    location: { type: String, trim: true },
    locationUrl: { type: String, trim: true },
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
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

let RequirementPost = mongoose.model("Requirementpost", RequirementPostSchema);
module.exports = { RequirementPost };
