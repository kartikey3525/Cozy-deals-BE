const { msg } = require("../../../../../config/message");
const { isValid } = require("../../../../middleware/validator.middleware");
const { sendSmsFromSpringedge } = require("../../../../util/springedge");
const { emailOtp } = require("../../../../util/emailOtp");

const { User } = require("../../../user/models/user.model");
const CryptoJS = require("crypto-js");

let validator = require("validator");

const allUsers = async (user, query) => {
  let { page = 1, limit = 10 } = query;
  let skip = (page - 1) * limit;
  let filter = { isDeleted: false, isDeactivated: false, roleId: { $ne: 2 } };
  let count = await User.countDocuments(filter);
  let users = await User.find(filter)
    .select("name profile email phone role roleId createdAt")
    .skip(skip)
    .limit(limit);
  return {
    msg: msg.success,
    count,
    currentPage: count,
    totalPages: Math.ceil(count / limit),
    data: users,
  };
};

const getUserById = async (user, query) => {
  if (!isValid(query.id)) throw "Invalid id passed";
  let user1 = await User.findOne({
    _id: query.id,
    isDeleted: false,
    isDeactivated: false,
  });
  if (!user1) throw msg.userNotFound;
  return {
    msg: msg.success,
    data: user1,
  };
};

module.exports = { allUsers, getUserById };
