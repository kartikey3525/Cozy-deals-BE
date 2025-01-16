const { recentPosts, allPosts } = require("../bussiness/post.bussiness");

exports.recentPosts = async (req) => await recentPosts(req.user, req.query);
exports.allPosts = async (req) => await allPosts(req.user, req.query, req.body);
