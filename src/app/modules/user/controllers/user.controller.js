const { sendOTP, verifyOTP } = require("../bussiness/user.bussiness")

exports.sendOTP = async (req) => await sendOTP(req.body);
exports.verifyOTP = async (req) => await verifyOTP(req.body);