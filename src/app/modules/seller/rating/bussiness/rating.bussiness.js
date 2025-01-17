const { msg } = require("../../../../../config/message");
const { isValid } = require("../../../../middleware/validator.middleware");
const { Rating } = require("../models/rating.model");

const rating = async (user, query, body) => {
  if (!isValid(query.postId)) throw "postId must be a valid";
  if (!isValid(body.rate) || body.rate < 1 || body.rate > 5)
    throw "rate must be between 1 and 5";
  let check = await Rating.findOneAndUpdate(
    { postId: query.postId },
    {},
    { upsert: true }
  );
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

module.exports = { rating, updateRating, deleteRating };
