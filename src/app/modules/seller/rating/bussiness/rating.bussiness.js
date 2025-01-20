const mongoose = require("mongoose");
const { msg } = require("../../../../../config/message");
const { isValid } = require("../../../../middleware/validator.middleware");
const { Rating } = require("../models/rating.model");

const rating = async (user, query, body) => {
  if (!isValid(query.postId)) throw "postId must be a valid";
  if (!isValid(body.rate) || body.rate < 1 || body.rate > 5)
    throw "rate must be between 1 and 5";

  const rate = await Rating.updateOne(
    { postId: query.postId, "rating.userId": { $ne: user._id } },
    { $addToSet: { rating: { userId: user._id, ...body } } },
    { new: true }
  );

  return {
    msg: msg.success,
    data: rate,
  };
};

const updateRating = async (user, query, body) => {
  if (!isValid(query.postId)) throw "postId must be a valid";
  Object.keys(body).forEach((key) => {
    if (!isValid(body[key])) delete body[key];
  });
  const rate = await Rating.updateOne(
    { postId: query.postId, "rating.userId": user._id },
    { $set: { "rating.$": body } },
    { new: true }
  );
  return {
    msg: msg.success,
  };
};

const deleteRating = async (user, query) => {
  if (!isValid(query.postId)) throw "postId must be a valid";
  const rate = await Rating.updateOne(
    { postId: query.postId, "rating.userId": user._id },
    { $pull: { rating: { userId: user._id } } }
  );
  return {
    msg: msg.success,
  };
};

const getRating = async (user, query) => {
  // abhi complete nhi hai
  if (!isValid(query.postId)) throw "postId must be a valid";
  //rate and it counts
  let rate = await Rating.aggregate([
    {
      $match: { postId: new mongoose.Types.ObjectId(query.postId) },
    },
    {
      $unwind: "$rating", // Flatten the array of ratings (if it's stored as an array)
    },
    {
      $group: {
        _id: "$rating.rate", // Group by rating value
        count: { $sum: 1 }, // Count the number of users for each rating
      },
    },
    {
      $sort: { _id: -1 }, // Sort ratings in descending order (5 to 1)
    },
    {
      $group: {
        _id: null,
        ratings: {
          $push: { rate: "$_id", count: "$count" }, // Reshape the result
        },
      },
    },
    {
      $addFields: {
        // Fill missing ratings with 0 count
        ratings: {
          $map: {
            input: [5, 4, 3, 2, 1], // The range of ratings we want to ensure
            as: "rate",
            in: {
              rate: "$$rate",
              count: {
                $reduce: {
                  input: "$ratings",
                  initialValue: 0,
                  in: {
                    $cond: [
                      { $eq: ["$$this.rate", "$$rate"] }, // Match the rating
                      "$$this.count",
                      "$$value",
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
  ]);
  if (rate.length == 0)
    rate = [
      {
        rate: 5,
        count: 0,
      },
      {
        rate: 4,
        count: 0,
      },
      {
        rate: 3,
        count: 0,
      },
      {
        rate: 2,
        count: 0,
      },
      {
        rate: 1,
        count: 0,
      },
    ];
  else rate = rate[0].ratings;

  let ratings = await Rating.aggregate([
    {
      $match: { postId: new mongoose.Types.ObjectId(query.postId) },
    },
    {
      $unwind: "$rating",
    },
    {
      $lookup: {
        from: "users",
        let: { id: "$rating.userId" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
          { $project: { name: 1, profile: 1 } },
        ],
        as: "userId",
      },
    },
    {
      $unwind: "$userId",
    },
    {
      $addFields: {
        "rating.likeByMe": {
          $in: [new mongoose.Types.ObjectId(user._id), "$rating.likes.userId"],
        },
      },
    },
    {
      $group: {
        _id: "$rating.userId",
        userId: { $first: "$userId._id" },
        name: { $first: "$userId.name" },
        profile: { $first: "$userId.profile" },
        rate: { $first: "$rating.rate" },
        date: { $first: "$rating.date" },
        feedback: { $first: "$rating.feedback" },
        images: { $first: "$rating.images" },
        likeByMe: { $first: "$rating.likeByMe" },
        comments: { $first: "$rating.comments" },
        likeCount: {
          $first: {
            $cond: {
              if: { $isArray: "$rating.likes" }, // Ensure likeCount is an array
              then: { $size: "$rating.likes" }, // Get size of the array
              else: 0, // Default to 0 if not an array
            },
          },
        },
        commentCount: {
          $first: {
            $cond: {
              if: { $isArray: "$rating.comments" }, // Ensure likeCount is an array
              then: { $size: "$rating.comments" }, // Get size of the array
              else: 0, // Default to 0 if not an array
            },
          },
        },
      },
    },
  ]);

  return {
    msg: msg.success,
    postId: query.postId,
    result: rate,
    rating: ratings,
  };
};

const likeRating = async (user, query) => {
  if (!isValid(query.postId)) throw "postId must be a valid";
  if (!isValid(query.userId)) throw "userId must be a valid";
  if (!isValid(query.status)) throw "status must be a valid";

  if (query.status == "like") {
    // like or disLike
    const rate = await Rating.updateOne(
      {
        postId: query.postId,
        "rating.userId": query.userId,
        "rating.likes.userId": { $ne: user._id }, // Ensure the user hasn't already liked it
      },
      { $addToSet: { "rating.$.likes": { userId: user._id } } },
      { new: true }
    );
  } else {
    const rate = await Rating.updateOne(
      {
        postId: query.postId,
        "rating.userId": query.userId,
      },
      { $pull: { "rating.$.likes": { userId: user._id } } },
      { new: true }
    );
  }
  return {
    msg: msg.success,
  };
};

const commentOnRating = async (user, query, body) => {
  if (!isValid(query.postId)) throw "postId must be a valid";
  if (!isValid(query.userId)) throw "userId must be a valid";
  if (!isValid(body.feedback)) throw "rate must be between 1 and 5";

  const rate = await Rating.updateOne(
    {
      postId: query.postId,
      "rating.userId": query.userId,
    },
    { $addToSet: { "rating.$.comments": { userId: user._id, ...body } } },
    { new: true }
  );

  return {
    msg: msg.success,
  };
};

const editComment = async (user, query, body) => {
  Object.keys(body).forEach((key) => {
    if (!isValid(body[key])) delete body[key];
  });
  if (!isValid(query.postId)) throw "postId must be a valid";
  if (!isValid(query.userId)) throw "userId must be a valid";
  if (!isValid(query.id)) throw "id must be a valid";

  // Perform the update operation
  const rate = await Rating.updateOne(
    {
      postId: query.postId, // Match the document with the given postId
      "rating.userId": query.userId, // Match the correct rating subdocument
      "rating.comments._id": query.id, // Match the specific comment by its ID
    },
    {
      $set: { "rating.$[rateElem].comments.$[commentElem]": body }, // Update the matched comment
    },
    {
      arrayFilters: [
        { "rateElem.userId": query.userId }, // Ensure the correct rating is targeted
        { "commentElem._id": query.id }, // Ensure the correct comment is targeted
      ],
      new: true, // Only works with findOneAndUpdate; not needed for updateOne
    }
  );

  return {
    msg: msg.success,
  };
};

const deleteComment = async (user, query) => {
  if (!isValid(query.postId)) throw "postId must be a valid";
  if (!isValid(query.userId)) throw "userId must be a valid";
  if (!isValid(query.id)) throw "id must be a valid";

  const rate = await Rating.updateOne(
    {
      postId: query.postId,
      "rating.userId": query.userId,
    },
    { $pull: { "rating.$.comments": { _id: query.id } } }
  );
  return {
    msg: msg.success,
  };
};

module.exports = {
  rating,
  updateRating,
  deleteRating,
  getRating,
  likeRating,
  commentOnRating,
  editComment,
  deleteComment,
};
