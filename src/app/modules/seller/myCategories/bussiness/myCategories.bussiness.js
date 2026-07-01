const { msg } = require("../../../../../config/message");
const { isValid } = require("../../../../middleware/validator.middleware");
const { MyCategories } = require("../models/myCategories.model");

const addCategory = async (user, body) => {
  const { category } = body;

  if (!isValid(category)) throw "category are required";

  let userCategories = await MyCategories.findOneAndUpdate(
    { userId: user._id },
    {},
    { new: true, upsert: true }
  );

  // Check if the category already exists
  if (userCategories.categories.includes(category)) {
    throw "Category already exists.";
  }

  userCategories.categories.push(category);
  await userCategories.save();

  return {
    msg: msg.success,
  };
};

const removeCategory = async (user, body) => {
  const { category } = body;
  if (!isValid(category)) throw "category are required";
  let userCategories = await MyCategories.findOneAndUpdate(
    { userId: user._id },
    { $pull: { categories: category } },
    { new: true }
  );
  return {
    msg: msg.success,
  };
};

const myCategory = async (user) => {
  let userCategories = await MyCategories.findOne({ userId: user._id });
  if (!userCategories) {
    userCategories = {
      userId: user._id,
      categories: [],
    };
  }
  return {
    msg: msg.success,
    count: userCategories.categories.length,
    data: userCategories.categories,
  };
};

module.exports = {
  addCategory,
  removeCategory,
  myCategory,
};
