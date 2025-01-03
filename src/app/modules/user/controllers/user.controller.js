const {
  sendOTP,
  verifyOTP,
  login,
  google,
  updateProfile,
  getProfile, deleteProfile, deactivateProfile
} = require("../bussiness/user.bussiness");

exports.sendOTP = async (req) => await sendOTP(req.body);
exports.verifyOTP = async (req) => await verifyOTP(req.body);
exports.login = async (req) => await login(req.body);
exports.google = async (req) => await google(req.body);
exports.updateProfile = async (req) => await updateProfile(req.user, req.body);
exports.getProfile = async (req) => await getProfile(req.user);
exports.deleteProfile = async (req) => await deleteProfile(req.user);
exports.deactivateProfile = async (req) => await deactivateProfile(req.user);
