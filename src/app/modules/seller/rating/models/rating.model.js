const mongoose = require("mongoose");

const rating = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rate: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    feedback: {
      type: String,
      trim: true,
    },
    images: [String],
    likes: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        feedback: {
          type: String,
          maxlength: 500,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { _id: false }
);

const ratingSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the user who gave the rating
      ref: "Post",
      required: true,
    },
    rating: [rating],
  },
  { timestamps: true }
);

const Rating = mongoose.model("Rating", ratingSchema);
module.exports = { Rating };
