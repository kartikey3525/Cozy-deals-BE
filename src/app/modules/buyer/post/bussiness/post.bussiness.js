const mongoose = require("mongoose");
const { msg } = require("../../../../../config/message");
const { isValid } = require("../../../../middleware/validator.middleware");
const { Post } = require("../../../seller/post/models/post.model");
const { User } = require("../../../user/models/user.model");
// const {getRating } = require ("../../../seller/rating/bussiness/");

// const recentPosts = async (user, query) => {
//   let { page = 1 } = query;
//   let limit = 10;
//   let skip = (page - 1) * limit;
//   let documents = await Post.countDocuments({
//      isDeleted: false
//     });
//   const posts = await Post.find({ 
//     isDeleted: false
//    })
//     .sort({ createdAt: -1 })
//     .skip(skip)
//     .limit(limit);
//   return {
//     msg: msg.success,
//     count: posts.length,
//     currentPage: page,
//     totalPages: Math.ceil(documents / limit),
//     totalDocuments: documents,
//     data: posts,
//   };
// };

const recentPosts = async (user, query) => {
  let { page = 1 } = query;
  let limit = 10;
  let skip = (page - 1) * limit;

  let totalDocuments = await Post.countDocuments({ isDeleted: false });

  const posts = await Post.find({ isDeleted: false })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    msg: "Success",
    count: posts.length,
    currentPage: page,
    totalPages: Math.ceil(totalDocuments / limit),
    totalDocuments: totalDocuments,
    data: posts,
  };
};

// const allPosts = async (user, query, body) => {
//   let {
//     startDistance,
//     endDistance,
//     rating,
//     topRated,
//     key,
//     categories,
//     myPost = false,
//     userId,
//     latitude,
//     longitude,
//   } = body;
//   let { page } = query;
//   let filter = { isDeleted: false };
//   let limit = 10;
  
//   if (isValid(key)) {
//     filter.$or = [
//       { title: new RegExp(key, "i") },
//       { description: new RegExp(key, "i") },
//       { categories: new RegExp(key, "i") },
//     ];
//   }
  
//   if (isValid(categories) && categories.length > 0)
//     filter.categories = { $in: categories };
  
//   if (myPost == true) filter.userId = user._id;
//   else if (isValid(userId)) filter.userId = new mongoose.Types.ObjectId(userId);
  
//   let documents = await Post.countDocuments(filter);

//   let pipeline = [
//     { $match: filter },
//     {
//       $lookup: {
//         from: "users", // Assuming the users collection is named "users"
//         localField: "userId",
//         foreignField: "_id",
//         as: "userData",
//       },
//     },
//     {
//       $unwind: {
//         path: "$userData",
//         preserveNullAndEmptyArrays: true,
//       },
//     },
//     {
//       $addFields: {
//         shopName: "$userData.shopName", // Add the shop name field
//         categories: "$userData.categories", // If the user has categories, you can add that too
//       },
//     },
//   ];

//   // Continue with your existing pipeline logic (rating, distance, pagination, etc.)

//   const posts = await Post.aggregate(pipeline);

//   return {
//     msg: msg.success,
//     count: posts.length,
//     currentPage: page,
//     totalPages: Math.ceil(documents / limit),
//     totalDocuments: documents,
//     data: posts,
//   };
// };

// const allShop = async (user, query, body) => {
//   let {
//     startDistance,
//     endDistance,
//     rating,
//     topRated,
//     key,
//     categories,
//     myPost = false,
//     userId,
//     latitude,
//     longitude,
//   } = body;
//   let { page } = query;
//   let limit = 10;
  
//   let filter = { isDeleted: false };

//   // If you are using key search to match user data, add it to the filter
//   if (isValid(key)) {
//     filter.$or = [
//       { name: new RegExp(key, "i") },
//       {profile:new RegExp(key, "i") },
//       {openTime:new RegExp(key, "i") },
      
//       {phone:new RegExp(key, "i") },
//       {closeTime:new RegExp(key, "i") },
//       { businessAddress: new RegExp(key, "i") },
//     ];
//   }

//   // If categories are specified, filter by them
//   if (isValid(categories) && categories.length > 0)
//     filter.categories = { $in: categories };

//   // If we need posts specific to the logged-in user
//   if (myPost === true) {
//     filter._id = user._id;
//   } else if (isValid(userId)) {
//     filter._id = new mongoose.Types.ObjectId(userId);
//   }

//   // Fetch users based on filter
//   let users = await User.find(filter).select("name openTime phone closeTime businessAddress profile");

//   let documents = users.length;

//   // Pagination logic
//   if (isValid(page)) {
//     page = parseInt(page);
//     let skip = (page - 1) * limit;
//     users = users.slice(skip, skip + limit);  // Apply pagination by slicing
//   }

//   return {
//     msg: msg.success,
//     count: users.length,
//     currentPage: page,
//     totalPages: Math.ceil(documents / limit),
//     totalDocuments: documents,
//     data: users, // Return the user data (with only shopName and businessAddress)
//   };
// };

// const allPosts = async (user, query, body) => {
//   let {
//     startDistance,
//     endDistance,
//     rating,
//     topRated,
//     key,
//     categories,
//     myPost = false,
//     userId,
//     latitude,
//     longitude,
//   } = body;
//   let { page } = query;
//   let filter = { isDeleted: false };
//   let limit = 10;

//   if (isValid(key)) {
//     filter.$or = [
//       { title: new RegExp(key, "i") },
//       { description: new RegExp(key, "i") },
//       { categories: new RegExp(key, "i") },
//     ];
//   }

//   if (isValid(categories) && categories.length > 0)
//     filter.categories = { $in: categories };

//   if (myPost == true) filter.userId = user._id;
//   else if (isValid(userId)) filter.userId = new mongoose.Types.ObjectId(userId);

//   let documents = await Post.countDocuments(filter);

//   let pipeline = [
//     { $match: filter },
//     {
//       $lookup: {
//         from: "users", // Assuming the users collection is named "users"
//         localField: "userId",
//         foreignField: "_id",
//         as: "userData",
//       },
//     },
//     {
//       $unwind: {
//         path: "$userData",
//         preserveNullAndEmptyArrays: true,
//       },
//     },
//     {
//       $addFields: {
//         shopName: "$userData.shopName", // Add the shop name field
//         categories: "$userData.categories", // If the user has categories, you can add that too
//       },
//     },
//   ];

//   // Fetch all posts with the pipeline
//   const posts = await Post.aggregate(pipeline);

//   // Fetch the average ratings for each post using getRating
//   const postsWithRatings = await Promise.all(
//     posts.map(async (post) => {
//       // Assuming postId corresponds to the post._id
//       try {
//         // Call getRating function for each post to get its average rating and detailed ratings
//         const ratingData = await getRating(user, { postId: post._id });

//         return {
//           ...post,
//           averageRating: ratingData.averageRating, // Add average rating to the post object
//           ratings: ratingData.rating, // Add all individual ratings if needed
//         };
//       } catch (error) {
//         console.error(`Error fetching rating for post ${post._id}:`, error);
//         return {
//           ...post,
//           averageRating: 0, // Default value if there's an error fetching rating
//           ratings: [], // Default empty ratings if there's an error
//         };
//       }
//     })
//   );

//   return {
//     msg: "Success",
//     count: postsWithRatings.length,
//     currentPage: page,
//     totalPages: Math.ceil(documents / limit),
//     totalDocuments: documents,
//     data: postsWithRatings,
//   };
// };

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
  let filter = { isDeleted: false }; // Ensuring only non-deleted posts
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
    { $match: filter },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userData",
      },
    },
    {
      $unwind: {
        path: "$userData",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: { "userData.isDeleted": false }, // Exclude posts from deleted users
    },
    {
      $addFields: {
        shopName: "$userData.shopName",
        categories: "$userData.categories",
      },
    },
  ];

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


const allShop = async (user, query, body) => {
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
  let limit = 10;

  let filter = { isDeleted: false };

  // If you are using key search to match user data, add it to the filter
  if (isValid(key)) {
    filter.$or = [
      { name: new RegExp(key, "i") },
      { profile: new RegExp(key, "i") },
      { openTime: new RegExp(key, "i") },
      { phone: new RegExp(key, "i") },
      { closeTime: new RegExp(key, "i") },
      { businessAddress: new RegExp(key, "i") },
    ];
  }

  // If categories are specified, filter by them
  if (isValid(categories) && categories.length > 0)
    filter.categories = { $in: categories };

  // If we need posts specific to the logged-in user
  if (myPost === true) {
    filter._id = user._id;
  } else if (isValid(userId)) {
    filter._id = new mongoose.Types.ObjectId(userId);
  }

  // Fetch users based on filter
  let users = await User.find(filter)
    .select("name openTime phone closeTime businessAddress profile categoriesPost")  // Fetch the relevant fields
    .lean(); // Lean allows us to work with plain JavaScript objects instead of Mongoose documents

  let documents = users.length;

  // Pagination logic
  if (isValid(page)) {
    page = parseInt(page);
    let skip = (page - 1) * limit;
    users = users.slice(skip, skip + limit);  // Apply pagination by slicing
  }

  // Map the data to include the categoriesPost in the desired format
  const usersWithCategories = users.map((user) => {
    // Check if categoriesPost is defined and is an array, if not, set it to an empty array
    const categoriesPost = Array.isArray(user.categoriesPost) ? user.categoriesPost : [];

    // Format categoriesPost for each user
    const formattedCategoriesPost = categoriesPost.map(post => ({
      title: post.title,
      categories: post.categories,
      images: post.images
    }));

    // Return user data with categoriesPost in the desired format
    return {
      name: user.name,
      email: user.email,
      phone: user.phone,
      openTime: user.openTime,
      closeTime: user.closeTime,
      profile: user.profile,
      businessAddress: user.businessAddress,
      categoriesPost: formattedCategoriesPost, // Include formatted categoriesPost
    };
  });

  return {
    msg: msg.success,
    count: users.length,
    currentPage: page,
    totalPages: Math.ceil(documents / limit),
    totalDocuments: documents,
    data: usersWithCategories,  // Return the user data with categoriesPost included in the required format
  };
};

const getPostById = async (user, query) => {
  if (!isValid(query.id)) throw "Invalid id";
  const posts = await Post.findById(query.id);

  if (!posts) throw "No posts found";

  return {
    msg: msg.success,
    result: posts,
  };
};

module.exports = { recentPosts, allPosts, allShop,getPostById };
