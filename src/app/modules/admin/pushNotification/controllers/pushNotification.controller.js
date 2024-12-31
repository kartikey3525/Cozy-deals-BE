const {
  notifi,
  myNotifications,
  deleteNotifications,
} = require("../business/pushNotification.business");

exports.notifi = async (req) => await notifi(req.body);
exports.myNotifications = async (req) =>
  await myNotifications(req.user, req.query);
exports.deleteNotifications = async (req) =>
  await deleteNotifications(req.user, req.query);
