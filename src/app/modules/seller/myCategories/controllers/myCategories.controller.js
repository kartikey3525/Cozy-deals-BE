const {
  addCategory,
  removeCategory,
  myCategory,
} = require("../bussiness/myCategories.bussiness");

exports.addCategory = async (req) => await addCategory(req.user, req.body);
exports.removeCategory = async (req) =>
  await removeCategory(req.user, req.body);
exports.myCategory = async (req) => await myCategory(req.user);
