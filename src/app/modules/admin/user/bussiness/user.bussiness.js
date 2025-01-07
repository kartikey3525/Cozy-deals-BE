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

const editProfile = async (user, query, body) => {
  Object.keys(body).forEach((key) => {
    if (!isValid(body[key])) delete body[key];
  });

  if (!isValid(query.id)) throw "Invalid user id";
  if (isValid(body.email) || isValid(body.phone)) {
    let existingUser = await User.findOne({
      $or: [{ email: body.email }, { phone: body.phone }],
      _id: { $ne: query.id },
      isDeleted: false,
    });
    if (existingUser) throw "email or phone already";
  }
  let user1 = await User.findOneAndUpdate(
    { _id: query.id, isDeleted: false },
    { $set: body },
    { new: true }
  );

  return {
    msg: msg.success,
  };
};

module.exports = { allUsers, getUserById, editProfile };
