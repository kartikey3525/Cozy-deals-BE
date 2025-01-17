const {
  rating,
  updateRating,
  deleteRating,
} = require("../bussiness/rating.bussiness");

exports.rating = async (req) => await rating(req.user, req.query, req.body);
exports.updateRating = async (req) =>
  await updateRating(req.user, req.query, req.body);
exports.deleteRating = async (req) => await deleteRating(req.user, req.query);
