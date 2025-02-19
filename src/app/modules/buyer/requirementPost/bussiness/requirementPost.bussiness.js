const { msg } = require("../../../../../config/message");
const { isValid } = require("../../../../middleware/validator.middleware");
const { RequirementPost } = require("../models/requirementPost.model");
const {
  notifi1,
} = require("../../pushNotification/business/pushNotification.business");
const { User } = require("../../../user/models/user.model");

const postRequirement = async (user, body) => {
  body.userId = user._id;
  const create = await RequirementPost.create(body);
  pushnotificationdemo(body.categories);
  return {
    msg: msg.success,
  };
};

const getRequirement = async (user) => {
  let filter = {
    isDeleted: false,
  };
  if (user.roleId == 0) filter.userId = user._id;
  const requirement = await RequirementPost.find(filter).sort({
    createdAt: -1,
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

// const pushnotificationdemo = (categories) => {
//   try {
//     //select that seller which deails in the category, select fcmtokens, id
//     // notifi1({ userData: data, title: "", message: "", image })
//   } catch (error) {

//   }
// }

const pushnotificationdemo = async (categories) => {
  try {
    const sellers = await User.find({
      roleId: 1,
      category: { $in: categories },
    }).select("fcmToken _id");
    console.log(sellers);
    const userData = sellers.map((seller) => ({
      _id: seller._id,
      fcmToken: seller.fcmToken,
    }));
    const title = "New Requirement Posted";
    const message =
      "A new requirement has been posted in the category you're interested in.";
    const image = ""; // Add any image URL if needed

    notifi1({ userData, title, message, image });
    return "";
  } catch (error) {
    console.error("Error in pushnotificationdemo:", error.message);
    return error.message;
  }
};

module.exports = {
  postRequirement,
  getRequirement,
  updateRequirement,
  deleteRequirement,
};
