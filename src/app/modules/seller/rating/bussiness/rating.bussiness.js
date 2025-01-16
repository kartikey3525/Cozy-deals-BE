const { msg } = require("../../../../../config/message");
const { isValid } = require("../../../../middleware/validator.middleware");
const { Rating } = require("../models/rating.model");

const rating = async (user, query, body) => {
  if (!isValid(query.postId)) throw "postId must be a valid";
  body.userId = user._id;
  if (!isValid(body.rate) || body.rate < 1 || body.rate > 5)
    throw "rate must be between 1 and 5";
  const rate = await Rating.updateOne(
    { postId: query.postId },
    { $push: { rating: body } },
    { upsert: true }
  );

  return {
    msg: msg.success,
    data: rate,
  };
};

module.exports = { rating };
