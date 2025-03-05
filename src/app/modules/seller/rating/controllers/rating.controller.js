const {
  rating,
  updateRating,
  deleteRating,
  getRating,
  likeRating,
  commentOnRating,
  editComment,
  deleteComment,
  recentRating,
} = require("../bussiness/rating.bussiness");

exports.rating = async (req) => await rating(req.user, req.query, req.body);
exports.getRating = async (req) => await getRating(req.user, req.query);
exports.updateRating = async (req) =>
  await updateRating(req.user, req.query, req.body);
exports.deleteRating = async (req) => await deleteRating(req.user, req.query);
exports.recentRating = async (req) => await recentRating(req.user, req.query);
exports.likeRating = async (req) => await likeRating(req.user, req.query);
exports.commentOnRating = async (req) =>
  await commentOnRating(req.user, req.query, req.body);
exports.editComment = async (req) =>
  await editComment(req.user, req.query, req.body);
exports.deleteComment = async (req) => await deleteComment(req.user, req.query);
