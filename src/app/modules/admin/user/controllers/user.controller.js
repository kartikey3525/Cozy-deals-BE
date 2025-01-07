const {
  allUsers,
  getUserById,
  editProfile,
} = require("../bussiness/user.bussiness");

const {
  deleteProfile,
  deactivateProfile,
} = require("../../../user/bussiness/user.bussiness");

exports.allUsers = async (req) => await allUsers(req.user, req.query);
exports.getUserById = async (req) => await getUserById(req.user, req.query);
exports.deleteProfile = async (req) =>
  await deleteProfile({ _id: req.query.id, id: req.query.id });
exports.deactivateProfile = async (req) =>
  await deactivateProfile({ _id: req.query.id, id: req.query.id });
exports.editProfile = async (req) =>
  await editProfile(req.user, req.query, req.body);
