const {
  createCategory,
  updateCategory,
  getCategory,
  deleteCategory,
} = require("../bussiness/categories.bussiness");

exports.createCategory = async (req) =>
  await createCategory(req.user, req.body);
exports.updateCategory = async (req) =>
  await updateCategory(req.user, req.body);
exports.getCategory = async (req) => await getCategory(req.user, req.query);
exports.deleteCategory = async (req) =>
  await deleteCategory(req.user, req.query);
