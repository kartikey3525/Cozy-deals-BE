const {
  recentPosts,
  allPosts,
  allShop,
  getPostById,
} = require("../bussiness/post.bussiness");

exports.recentPosts = async (req) => await recentPosts(req.user, req.query);
exports.allPosts = async (req) => await allPosts(req.user, req.query, req.body);

exports.allShop = async (req) => await allShop(req.user, req.query, req.body);
exports.getPostById = async (req) => await getPostById(req.user, req.query);
