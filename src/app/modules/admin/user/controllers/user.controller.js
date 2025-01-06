const { allUsers, getUserById } = require("../bussiness/user.bussiness");

exports.allUsers = async (req) => await allUsers(req.user, req.query);
exports.getUserById = async (req) => await getUserById(req.user, req.query);
