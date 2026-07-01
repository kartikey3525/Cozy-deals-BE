const { User } = require("../../../user/models/user.model");
const { sendPushNotification } = require("./notification");
const { Notification } = require("../models/pushNotification.model");
const { msg } = require("../../../../../config/message");
const { isValid } = require("../../../../middleware/validator.middleware");
const mongoose = require("mongoose");

// const notifi1 = async (body) => {
//   try {
//     let { ids, title, message, image } = body;

//     // Fetch users with their FCM tokens
//     let userData = await User.find({ _id: { $in: ids } }).select("fcmToken");
//     console.log(userData); // Debugging: Check the fetched user data

//     // Filter out users without FCM tokens
//     const validUsers = userData.filter(user => user.playerID);

//     if (validUsers.length === 0) {
//       console.error("No valid users with FCM tokens found!");
//       return;''
//     }

//     // Extract user IDs for OneSignal
//     const userIds = validUsers.map(user => user._id.toString());

//     // Send push notification using user IDs
//     const result = await sendPushNotification(userIds, title, message, image);
//     console.log("Notification result:", result);

//     // Update notification history for each user
//     for (let i = 0; i < validUsers.length; i++) {
//       const user = validUsers[i];

//       await Notification.updateOne(
//         { userId: user._id },
//         {
//           $push: {
//             notificationHistory: {
//               message: message,
//               date: new Date().toLocaleString("en-US", {
//                 timeZone: "Asia/Kolkata",
//               }),
//             },
//           },
//         },
//         { new: true, upsert: true }
//       );
//     }

//     return "Successfully sent notifications";
//   } catch (error) {
//     console.error("Error in notifi function:", error.message);
//     return error.message;
//   }
// };

const notifi = async (body) => {
  try {
    let { ids, title, message, image } = body;
    let userData = await User.find({ _id: { $in: ids } }).select("fcmToken");

    for (let i = 0; i < userData.length; i++) {
      await Notification.updateOne(
        { userId: userData[i]._id },
        {
          $push: {
            notificationHistory: {
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

// const notifi = async (body) => {

//   try {
//     let { ids, title, message, image } = body;
//     let userData = await User.find({ _id: { $in: ids } }).select("fcmToken");
//     console.log(userData.fcmToken);
//     for (let i = 0; i < userData.length; i++) {
//       await Notification.updateOne(
//         { userId: userData[i]._id },
//         {
//           $push: {
//             notificationHistory: {
//               message: message,
//               date: new Date().toLocaleString("en-US", {
//                 timeZone: "Asia/Kolkata",
//               }),
//             },
//           },
//         },
//         { new: true, upsert: true }
//       );
//       await sendPushNotification(userData[i].fcmToken, title, message, image);
//     }

//     return "successfully notifi";
//   } catch (error) {
//     return error.message;
//   }
// };


const myNotifications = async (user, query) => {
  const noti = await Notification.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(user._id) } },
    { $unwind: "$notificationHistory" },
    {
      $group: {
        _id: "$notificationHistory._id",
        message: { $first: "$notificationHistory.message" },
        date: { $first: "$notificationHistory.date" },
      },
    },
    { $sort: { date: -1 } },
  ]);
  return {
    msg: msg.success,
    count: noti.length,
    data: noti,
  };
};

const deleteNotifications = async (user, query) => {
  if (!isValid(query.id)) throw "Invalid id passed";
  const noti = await Notification.updateOne(
    { userId: user._id },
    { $pull: { notificationHistory: { _id: query.id } } },
    { new: true }
  );
  return {
    msg: msg.success,
  };
};

module.exports = { notifi, myNotifications, deleteNotifications };
