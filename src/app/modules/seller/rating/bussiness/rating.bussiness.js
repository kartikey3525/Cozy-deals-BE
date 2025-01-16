const { msg } = require("../../../../../config/message");
const { isValid } = require("../../../../middleware/validator.middleware");
const { Rating } = require("../models/rating.model");

const rating = async (user, query, body) => {
  if (!isValid(query.postId)) throw "postId must be a valid";
  body.userId = user._id;
  const rate = await Rating.updateOne(
    { postId: query.postId },
    { $push: { rating: body } },
    { upsert: true }
  );
  return {
    msg: msg.success,
  };
};

module.exports = { rating };
