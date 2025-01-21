const mongoose = require("mongoose");

const ReportIssueSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    images: [String],
    description: {
      type: String,
      required: true,
      trim: true,
    },
    response: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const ReportIssue = mongoose.model("Reportissue", ReportIssueSchema);
module.exports = { ReportIssue };
