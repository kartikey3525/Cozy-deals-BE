const { msg } = require("../../../../../config/message");
const { isValid } = require("../../../../middleware/validator.middleware");
const { RequirementPost } = require("../models/requirementPost.model");
const {
  notifi1,
} = require("../../pushNotification/business/pushNotification.business");
const { User } = require("../../../user/models/user.model");

const postRequirement = async (user, body) => {
  body.userId = user._id;

  await RequirementPost.create(body);

  try {
    await pushnotificationdemo(body.categories);
  } catch (err) {
    console.log("Notification error:", err);
  }

  return {
    msg: msg.success,
  };
};

// const getRequirement = async (user, category) => {
//   let filter = {
//     isDeleted: false,
//   };
//   if (user.roleId == 0) filter.userId = user._id;
  
//   // Add category filter if provided
//   if (category) {
//     filter.categories = category;
//   }

//   const requirement = await RequirementPost.find(filter).sort({
//     createdAt: -1,
//   });
//   return {
//     msg: "Ok",
//     count: requirement.length,
//     data: requirement,
//   };
// };

const getRequirement = async (user, category) => {
  let filter = { isDeleted: false };

  if (user.roleId == 0) filter.userId = user._id;

  // Add category filter if provided
  if (category) filter.categories = category;

  // Fetch user IDs where isDeleted is false
  let activeUserIds = await User.find({ isDeleted: false }).distinct("_id");

  // Ensure requirements only belong to non-deleted users
  filter.userId = { $in: activeUserIds };

  const requirement = await RequirementPost.find(filter).sort({
    createdAt: -1,
  });

  return {
    msg: "Ok",
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

const {
  notifi,
} = require("../../pushNotification/business/pushNotification.business");

const pushnotificationdemo = async (categories) => {
  try {
    const sellers = await User.find({
      roleId: 1,
      selectedCategories: { $in: categories }, // fixed field name
    }).select("_id");

    if (!sellers.length) return "No matching sellers found";

    const ids = sellers.map(seller => seller._id);
    const title = "New Requirement Posted";
    const message =
      "A new requirement has been posted in the category you're interested in.";
    const image = "";

    await notifi({ ids, title, message, image }); // correct function + shape
    return "Notifications sent";
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
