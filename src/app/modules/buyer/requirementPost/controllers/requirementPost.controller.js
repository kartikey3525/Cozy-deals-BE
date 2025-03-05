const {
  postRequirement,
  getRequirement,
  updateRequirement,
  deleteRequirement,
} = require("../bussiness/requirementPost.bussiness");

exports.postRequirement = async (req) =>
  await postRequirement(req.user, req.body);
// exports.getRequirement = async (req) => await getRequirement(req.user);
exports.getRequirement = async (req) => {
  const category = req.query.category; // Get the category from query parameters
  return await getRequirement(req.user, category);
};

exports.updateRequirement = async (req) =>
  await updateRequirement(req.user, req.query, req.body);
exports.deleteRequirement = async (req) =>
  await deleteRequirement(req.user, req.query);
