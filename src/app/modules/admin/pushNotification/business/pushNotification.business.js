const { User } = require("../../../user/models/user.model");
const { sendPushNotification } = require("./notification");
const { Notification } = require("../models/pushNotification.model");
const { msg } = require("../../../../../config/message");
const { isValid } = require("../../../../middleware/validator.middleware");

const notifi = async (body) => {
  try {
    let { ids, title, message, type, image } = body;
    let userData = await User.find({ _id: { $in: ids } }).select("fcmToken");

    for (let i = 0; i < userData.length; i++) {
      await Notification.findOneAndUpdate(
        { userId: userData[i]._id },
        {
          $push: {
            notificationHistory: {
              type: type,
              title: title,
              message: message,
              date: new Date().toLocaleString("en-US", {
                timeZone: "Asia/Kolkata",
              }),
            },
          },
        },
        { new: true, upsert: true }
      );
      await sendPushNotification(userData[i].fcmToken, title, message, image);
    }

    return "successfully notifi";
  } catch (error) {
    return error.message;
  }
};

const myNotifications = async (user, query) => {
  const noti = await Notification.aggregate([
    { $match: { userId: user._id } },
    { $unwind: "$notificationHistory" },
    { $sort: { "notificationHistory.date": -1 } },
  ]);
  return {
    msg: msg.success,
    count: noti.length,
    data: noti,
  };
};

const deleteNotifications = async (user, query) => {
  if (!isValid(query.id)) throw "Invalid id passed";
  const noti = await Notification.findOneAndUpdate(
    { userId: user._id },
    { $pull: { notificationHistory: { _id: query.id } } },
    { new: true }
  );
  return {
    msg: msg.success,
  };
};

module.exports = { notifi, myNotifications, deleteNotifications };
