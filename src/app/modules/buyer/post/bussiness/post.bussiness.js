const mongoose = require("mongoose");
const { msg } = require("../../../../../config/message");
const { isValid } = require("../../../../middleware/validator.middleware");
const { Post } = require("../../../seller/post/models/post.model");
const { User } = require("../../../user/models/user.model");

const recentPosts = async (user, query) => {
  let { page = 1 } = query;
  let limit = 10;
  let skip = (page - 1) * limit;
  let documents = await Post.countDocuments({ isDeleted: false });
  const posts = await Post.find({ isDeleted: false })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  return {
    msg: msg.success,
    count: posts.length,
    currentPage: page,
    totalPages: Math.ceil(documents / limit),
    totalDocuments: documents,
    data: posts,
  };
};

const allPosts = async (user, query, body) => {
  let {
    startDistance,
    endDistance,
    rating,
    topRated,
    key,
    categories,
    myPost = false,
    userId,
    latitude,
    longitude,
  } = body;
  let { page } = query;
  let filter = { isDeleted: false };
  let limit = 10;
  if (isValid(key)) {
    filter.$or = [
      { title: new RegExp(key, "i") },
      { description: new RegExp(key, "i") },
      { categories: new RegExp(key, "i") },
    ];
  }
  if (isValid(categories) && categories.length > 0)
    filter.categories = { $in: categories };
  if (myPost == true) filter.userId = user._id;
  else if (isValid(userId)) filter.userId = new mongoose.Types.ObjectId(userId);
  let documents = await Post.countDocuments(filter);

  let pipeline = [
    {
      $match: filter,
    },
  ];

  pipeline.push({
    $lookup: {
      from: "ratings",
      let: { id: "$_id" },
      pipeline: [
        { $match: { $expr: { $eq: ["$postId", "$$id"] } } },
        {
          $unwind: "$rating", // Deconstruct the rating array into individual documents
        },
        {
          $group: {
            _id: "$_id",
            averageRating: { $avg: "$rating.rate" }, // Calculate the average rating
            totalRatings: { $sum: 1 }, // Optional: Count total ratings
          },
        },
        {
          $project: {
            _id: 1,
            averageRating: { $round: ["$averageRating", 2] }, // Round to 2 decimal places
            totalRatings: 1,
          },
        },
      ],
      as: "rating",
    },
  });
  pipeline.push({
    $addFields: {
      rating: {
        $ifNull: [
          { $arrayElemAt: ["$rating", 0] }, // First element of the array (or null if the array is empty)
          { averageRating: 0, totalRatings: 0 }, // Default value if the first element is null
        ],
      },
    },
  });
  if (isValid(topRated)) {
    pipeline.push({ $sort: { "rating.averageRating": -1 } });
  }
  if (isValid(rating)) {
    rating = parseInt(rating);
    pipeline.push({ $match: { "rating.averageRating": { $gte: rating } } });
  }

  // let userData = await User.findById(user._id).select("longitude latitude");

  if (isValid(latitude) && isValid(longitude)) {
    pipeline.push({
      $addFields: {
        distance: {
          $let: {
            vars: {
              lat1: { $toDouble: "$latitude" },
              lon1: { $toDouble: "$longitude" },
              lat2: { $toDouble: latitude },
              lon2: { $toDouble: longitude },
              earthRadius: 6371, // Earth's radius in kilometers (valid variable name)
            },
            in: {
              $multiply: [
                "$$earthRadius",
                {
                  $acos: {
                    $add: [
                      {
                        $multiply: [
                          { $sin: { $degreesToRadians: "$$lat1" } },
                          { $sin: { $degreesToRadians: "$$lat2" } },
                        ],
                      },
                      {
                        $multiply: [
                          { $cos: { $degreesToRadians: "$$lat1" } },
                          { $cos: { $degreesToRadians: "$$lat2" } },
                          {
                            $cos: {
                              $subtract: [
                                { $degreesToRadians: "$$lon2" },
                                { $degreesToRadians: "$$lon1" },
                              ],
                            },
                          },
                        ],
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      },
    });

    pipeline.push({
      $addFields: { distance: { $round: ["$distance", 2] } },
    });
    if (isValid(startDistance)) startDistance = parseInt(startDistance);
    else startDistance = 0;
    if (isValid(endDistance)) endDistance = parseInt(endDistance);
    else endDistance = 5;
    pipeline.push({
      $match: {
        distance: { $gte: startDistance, $lte: endDistance },
      },
    });
  }

  if (isValid(page)) {
    page = parseInt(page);
    let skip = (page - 1) * limit;
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });
  }

  const posts = await Post.aggregate(pipeline);

  return {
    msg: msg.success,
    count: posts.length,
    currentPage: page,
    totalPages: Math.ceil(documents / limit),
    totalDocuments: documents,
    data: posts,
  };
};

module.exports = { recentPosts, allPosts };
