const mongoose = require("mongoose");
const { msg } = require("../../../../../config/message");
const { isValid } = require("../../../../middleware/validator.middleware");
const { Rating } = require("../models/rating.model");
const moment = require("moment"); 

const rating = async (user, query, body) => {
  if (!isValid(query.postId)) throw "postId must be a valid";
  if (!isValid(body.rate) || body.rate < 1 || body.rate > 5)
    throw "rate must be between 1 and 5";

  await Rating.updateOne(
    { postId: query.postId, "rating.userId": { $ne: user._id } },
    {
      $addToSet: {
        rating: [
          {
            userId: user._id,
            rate: body.rate,
            feedback: body.feedback,
            images: body.images,
          },
        ],
      },
    },
    { new: true, upsert: true }
  );

  return { msg: "Ok" }; // Only return the success message
};

// const rating = async (user, query, body) => {
//   if (!isValid(query.postId)) throw { message: "postId must be valid", statusCode: 400 };

//   if (!isValid(body.rate) || body.rate < 1 || body.rate > 5 || isNaN(body.rate))
//     throw { message: "rate must be between 1 and 5 (inclusive) and a valid number", statusCode: 400 };

//   // Check if the post exists (optional but recommended)
//   const postExists = await Rating.exists({ _id: query.postId });
//   if (!postExists) {
//     throw { message: "Post not found", statusCode: 404 };
//   }

//   // Update the rating for the post if the user hasn't rated it yet
//   const rate = await Rating.findOneAndUpdate(
//     { postId: query.postId, "rating.userId": { $ne: user._id } },  // Prevent the user from rating again
//     {
//       $addToSet: {  // Add to the rating array if not already present
//         rating: {
//           userId: user._id,
//           rate: body.rate,
//           feedback: body.feedback || "",
//           images: body.images || [],
//         },
//       },
//     },
//     {
//       new: true,  // Return the updated document
//       upsert: true // Create a new document if it doesn't exist
//     }
//   );

//   // Return the updated rating array
//   return {
//     msg: "Rating posted successfully",
//     data: rate,  // This will contain the entire document, including the ratings array
//   };
// };

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

// const getRating = async (user, query) => {
//   if (!isValid(query.postId)) throw "postId must be a valid";

//   // Aggregate ratings grouped by rate value
//   let rateData = await Rating.aggregate([
//     {
//       $match: { postId: new mongoose.Types.ObjectId(query.postId) },
//     },
//     {
//       $unwind: "$rating",
//     },
//     {
//       $group: {
//         _id: "$rating.rate",
//         count: { $sum: 1 },
//       },
//     },
//     {
//       $sort: { _id: -1 },
//     },
//   ]);

//   // Initialize default ratings from 5 to 1
//   let rate = [
//     { rate: 5, count: 0 },
//     { rate: 4, count: 0 },
//     { rate: 3, count: 0 },
//     { rate: 2, count: 0 },
//     { rate: 1, count: 0 },
//   ];

//   // Update default values with actual counts
//   rateData.forEach((item) => {
//     let index = rate.findIndex((r) => r.rate === item._id);
//     if (index !== -1) {
//       rate[index].count = item.count;
//     }
//   });

//   // Fetch all individual ratings with user details
//   let ratings = await Rating.aggregate([
//     {
//       $match: { postId: new mongoose.Types.ObjectId(query.postId) },
//     },
//     {
//       $unwind: "$rating",
//     },
//     {
//       $lookup: {
//         from: "users",
//         localField: "rating.userId",
//         foreignField: "_id",
//         as: "user",
//       },
//     },
//     {
//       $unwind: "$user",
//     },
//     {
//       $project: {
//         _id: "$rating.userId",
//         userId: "$user._id",
//         name: "$user.name",
//         profile: "$user.profile",
//         rate: "$rating.rate",
//         date: "$rating.date",
//         feedback: "$rating.feedback",
//         images: "$rating.images",
//         likeByMe: {
//           $in: [new mongoose.Types.ObjectId(user._id), "$rating.likes.userId"],
//         },
//         comments: "$rating.comments",
//         likeCount: { $size: { $ifNull: ["$rating.likes", []] } },
//         commentCount: { $size: { $ifNull: ["$rating.comments", []] } },
//       },
//     },
//   ]);

//   return {
//     msg: msg.success,
//     postId: query.postId,
//     result: rate,
//     rating: ratings,
//   };
// };

const getRating = async (user, query) => {
  if (!isValid(query.postId)) throw "postId must be a valid";

  // Get rating count data (ratings per score)
  let rateData = await Rating.aggregate([
    {
      $match: { postId: new mongoose.Types.ObjectId(query.postId) },
    },
    {
      $unwind: "$rating",
    },
    {
      $group: {
        _id: "$rating.rate",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: -1 },
    },
  ]);

  // Initialize default ratings from 5 to 1
  let rate = [
    { rate: 5, count: 0 },
    { rate: 4, count: 0 },
    { rate: 3, count: 0 },
    { rate: 2, count: 0 },
    { rate: 1, count: 0 },
  ];

  // Update default values with actual counts
  rateData.forEach((item) => {
    let index = rate.findIndex((r) => r.rate === item._id);
    if (index !== -1) {
      rate[index].count = item.count;
    }
  });

  // Calculate average rating for this postId
  const totalRatings = rate.reduce((sum, item) => sum + item.rate * item.count, 0);
  const totalCount = rate.reduce((sum, item) => sum + item.count, 0);
  const averageRating = totalCount > 0 ? (totalRatings / totalCount).toFixed(2) : 0;

  // Fetch all individual ratings with user details and calculate "time ago"
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
        localField: "rating.userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $project: {
        _id: "$rating.userId",
        userId: "$user._id",
        name: "$user.name",
        profile: "$user.profile",
        rate: "$rating.rate",
        date: "$rating.date",
        feedback: "$rating.feedback",
        images: "$rating.images",
        likeByMe: {
          $in: [
            new mongoose.Types.ObjectId(user._id),
            { $ifNull: ["$rating.likes", []] },
          ],
        },
        disLikeByMe: {
          $in: [
            new mongoose.Types.ObjectId(user._id),
            { $ifNull: ["$rating.disLikes", []] },
          ],
        },
        comments: "$rating.comments",
        likeCount: { $size: { $ifNull: ["$rating.likes", []] } },
        disLikeCount: { $size: { $ifNull: ["$rating.disLikes", []] } },
        commentCount: { $size: { $ifNull: ["$rating.comments", []] } },
      },
    },
  ]);

  // Format the "time ago" value for each rating
  ratings = ratings.map((rating) => {
    return {
      ...rating,
      timeAgo: moment(rating.date).fromNow(), // e.g., "2 weeks ago"
    };
  });

  return {
    msg: "Ok",
    postId: query.postId,
    result: rate,
    averageRating,
    rating: ratings,
  };
};


const likeRating = async (user, query) => {
  if (!isValid(query.postId)) throw "postId must be a valid";
  if (!isValid(query.userId)) throw "userId must be a valid";
  if (!isValid(query.status)) throw "status must be a valid";

  if (query.status == "liketrue") {
    // liketrue, disliketrue, likefalse, dislikefalse

    const rate = await Rating.updateOne(
      {
        postId: query.postId,
        "rating.userId": query.userId,
        "rating.likes.userId": { $ne: user._id }, // Ensure the user hasn't already liked it
      },
      { $addToSet: { "rating.$.likes": { userId: user._id } } },
      { new: true }
    );
    const rate1 = await Rating.updateOne(
      {
        postId: query.postId,
        "rating.userId": query.userId,
      },
      { $pull: { "rating.$.disLikes": { userId: user._id } } },
      { new: true }
    );
  } else if (query.status == "disliketrue") {
    // liketrue, disliketrue, likefalse, dislikefalse

    const rate = await Rating.updateOne(
      {
        postId: query.postId,
        "rating.userId": query.userId,
        "rating.disLikes.userId": { $ne: user._id }, // Ensure the user hasn't already liked it
      },
      { $addToSet: { "rating.$.disLikes": { userId: user._id } } },
      { new: true }
    );
    const rate1 = await Rating.updateOne(
      {
        postId: query.postId,
        "rating.userId": query.userId,
      },
      { $pull: { "rating.$.likes": { userId: user._id } } },
      { new: true }
    );
  } else if (query.status == "likefalse") {
    // liketrue, disliketrue, likefalse, dislikefalse
    const rate1 = await Rating.updateOne(
      {
        postId: query.postId,
        "rating.userId": query.userId,
      },
      { $pull: { "rating.$.likes": { userId: user._id } } },
      { new: true }
    );
  } else if (query.status == "dislikefalse") {
    // liketrue, disliketrue, likefalse, dislikefalse
    const rate1 = await Rating.updateOne(
      {
        postId: query.postId,
        "rating.userId": query.userId,
      },
      { $pull: { "rating.$.disLikes": { userId: user._id } } },
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

const recentRating = async (user, query) => {
  let { postId } = query;

  if (!postId) {
    return { success: false, msg: "Post ID is required" };
  }

  let recentRatings = await Rating.aggregate([
    {
      $match: { postId: new mongoose.Types.ObjectId(postId) },
    },
    {
      $unwind: "$rating",
    },
    {
      $lookup: {
        from: "users",
        localField: "rating.userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $project: {
        _id: "$rating.userId",
        userId: "$user._id",
        name: "$user.name",
        profile: "$user.profile",
        rate: "$rating.rate",
        date: "$rating.date",
        feedback: "$rating.feedback",
        images: "$rating.images",
        likeByMe: {
          $in: [new mongoose.Types.ObjectId(user._id), "$rating.likes.userId"],
        },
        comments: "$rating.comments",
        likeCount: { $size: { $ifNull: ["$rating.likes", []] } },
        commentCount: { $size: { $ifNull: ["$rating.comments", []] } },
      },
    },
    {
      $sort: { date: -1 }, // Sort by date (most recent first)
    },
    {
      $limit: 3, // Fetch only the latest 3 ratings
    },
  ]);

  return {
    success: true,
    msg: "Success",
    postId: postId,
    recentRatings: recentRatings,
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
  recentRating,
};
