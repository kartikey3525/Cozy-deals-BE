const { msg } = require("../../../../../config/message");
const { isValid } = require("../../../../middleware/validator.middleware");
const { RequirementPost } = require("../models/requirementPost.model");

const postRequirement = async (user, body) => {
  body.userId = user._id;
  const create = await RequirementPost.create(body);
  return {
    msg: msg.success,
  };
};

const getRequirement = async (user) => {
  const requirement = await RequirementPost.find({
    userId: user._id,
    isDeleted: false,
  });
  return {
    msg: msg.success,
    count: requirement.length,
    data: requirement,
  };
};

const updateRequirement = async (user, query, body) => {
  if (!isValid(query.id)) throw "Invalid id passed";
  Object.keys(body).forEach((key) => {
    if (!isValid(body[key])) delete body[key];
  });
  let requirement = await RequirementPost.findOneAndUpdate(
    { userId: user._id, _id: query.id },
    { $set: body },
    { new: true }
  );
  return {
    msg: msg.success,
  };
};

const deleteRequirement = async (user, query) => {
  if (!isValid(query.id)) throw "Invalid id passed";
  let requirement = await RequirementPost.findOneAndUpdate(
    { userId: user._id, _id: query.id },
    { $set: { isDeleted: true } },
    { new: true }
  );
  return {
    msg: msg.success,
  };
};

module.exports = {
  postRequirement,
  getRequirement,
  updateRequirement,
  deleteRequirement,
};
