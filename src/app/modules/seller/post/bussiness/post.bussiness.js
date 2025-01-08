const { msg } = require("../../../../../config/message");
const { isValid } = require("../../../../middleware/validator.middleware");
const { Post } = require("../models/post.model");

const create = async (user, body) => {
  body.userId = user._id;
  const create = await Post.create(body);
  return {
    msg: msg.success,
  };
};

const get = async (user) => {
  const post = await Post.find({
    userId: user._id,
    isDeleted: false,
  });
  return {
    msg: msg.success,
    count: post.length,
    data: post,
  };
};

const update = async (user, query, body) => {
  if (!isValid(query.id)) throw "Invalid id passed";
  Object.keys(body).forEach((key) => {
    if (!isValid(body[key])) delete body[key];
  });
  let post = await Post.findOneAndUpdate(
    { userId: user._id, _id: query.id },
    { $set: body },
    { new: true }
  );
  return {
    msg: msg.success,
  };
};

const deletes = async (user, query) => {
  if (!isValid(query.id)) throw "Invalid id passed";
  let post = await Post.findOneAndUpdate(
    { userId: user._id, _id: query.id },
    { $set: { isDeleted: true } },
    { new: true }
  );
  return {
    msg: msg.success,
  };
};

module.exports = { create, get, update, deletes };
