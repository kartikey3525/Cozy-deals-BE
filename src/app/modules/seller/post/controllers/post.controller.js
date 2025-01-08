const { create, get, update, deletes } = require("../bussiness/post.bussiness");

exports.create = async (req) => await create(req.user, req.body);
exports.get = async (req) => await get(req.user);
exports.update = async (req) => await update(req.user, req.query, req.body);
exports.deletes = async (req) => await deletes(req.user, req.query);
