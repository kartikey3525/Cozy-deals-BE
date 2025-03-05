const admin = require("firebase-admin");
// const axios = require("axios");
// const {User}=  require ("../../../user/models/user.model")
// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(require("./google-services.json")),
});

// const sendPushNotification = async (userIds, title, message, image) => {
//   if (!Array.isArray(userIds)) {
//     console.error("No valid user IDs provided!");
//     return;
//   }

//   const oneSignalAppId = "016f7214-9a7e-407a-922c-82a83b6f1fa6";
//   const oneSignalApiKey = "os_v2_app_afxxefe2pzahvermqkudw3y7uzhjggjolypes3542ktfulfanextutfnskgtsj4qutn6arb7x2jrlckuc5pfsqkkgnnpqeovwibvvny";

//   const notificationContent = {
//     app_id: oneSignalAppId,
//     contents: { en: message },
//     headings: { en: title },
//     include_external_user_ids: userIds, // Ensure this matches the external_user_id set in the app
//     data: image ? { image: image } : {},
//   };

//   try {
//     const response = await axios.post(
//       "https://onesignal.com/api/v1/notifications",
//       notificationContent,
//       {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${oneSignalApiKey}`,
//         },
//       }
//     );

//     console.log("Notification sent successfully:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error(
//       "Error sending notification:",
//       error.response ? error.response.data : error.message
//     );
//     throw error;
//   }
// };
// ----------
// Send a Push Notification
// const sendPushNotification = async (fcmTokens, title, message, image) => {
//   if (!Array.isArray(fcmTokens) || fcmTokens.length === 0) {
//     console.error("No valid FCM tokens provided!");
//     return;
//   }

//   const oneSignalAppId = "9a3d89c2-f70d-42be-b25d-ed5e35715ae4";
//   const oneSignalApiKey =
//     "os_v2_app_ti6ytqxxbvbl5ms55vpdk4k24rofz4uyr7multulno2xrrmqav225k7v6k2vtme3wgugnsuj4lqr34kwnasajtvk27kf4ax5rjwu6eq";

//   // Filter out invalid or empty tokens
//   const validTokens = fcmTokens.filter(Boolean);
//   if (validTokens.length === 0) {
//     console.error("All provided FCM tokens are invalid!");
//     return;
//   }

//   const notificationContent = {
//     app_id: oneSignalAppId,
//     contents: { en: message },
//     headings: { en: title },
//     include_player_ids: validTokens,
//     data: image ? { image: image } : {},
//   };

//   try {
//     const response = await axios.post(
//       "https://onesignal.com/api/v1/notifications",
//       notificationContent,
//       {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${oneSignalApiKey}`,
//         },
//       }
//     );

//     console.log("Notification sent successfully:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error(
//       "Error sending notification:",
//       error.response ? error.response.data : error.message
//     );
//     throw error;
//   }
// };

const sendPushNotification = (deviceToken, title, message, image) => {
  try {
    //   const additionalData = {
    //     "image-url": image,
    //     "click_action": "FLUTTER_NOTIFICATION_CLICK"
    // }

    const messagePayload = {
      notification: {
        title: title,
        body: message,
        image: image,
      },
      // data: additionalData,
      token: deviceToken,
    };

    admin
      .messaging()
      .send(messagePayload)
      .then((response) => {
        console.log("Successfully sent message:", response);
      })
      .catch((error) => {
        console.log("Error sending message:", error);
      });
  } catch (error) {
    console.log(error.message);
  }
};

async function sendNotification(token, title, body) {
  if (!token) {
    console.error("Missing FCM token");
    throw new Error("FCM token is required.");
  }

  const message = {
    notification: {
      title,
      body,
    },
    token, // ✅ Corrected: Using the FCM token directly
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Notification sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
}

module.exports = { sendPushNotification, sendNotification };
