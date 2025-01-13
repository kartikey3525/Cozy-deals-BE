const { uploadVideo, uploadDocument } = require("../business/chatApp.business");

exports.uploadVideo = async (req) =>
  await uploadVideo(req.user, req.query, req.files);
exports.uploadDocument = async (req) =>
  await uploadDocument(req.user, req.query, req.files);
