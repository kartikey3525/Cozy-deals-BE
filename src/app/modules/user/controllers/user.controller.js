const {
  sendOTP,
  verifyOTP,
  login,
  google,
} = require("../bussiness/user.bussiness");

exports.sendOTP = async (req) => await sendOTP(req.body);
exports.verifyOTP = async (req) => await verifyOTP(req.body);
exports.login = async (req) => await login(req.body);
exports.google = async (req) => await google(req.body);
