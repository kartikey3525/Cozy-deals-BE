const { msg } = require("../../../../../config/message");
const { isValid } = require("../../../../middleware/validator.middleware");
const { Post } = require("../../../seller/post/models/post.model");

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

module.exports = { recentPosts, allPosts };
