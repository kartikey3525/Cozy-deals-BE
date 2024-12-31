const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(require("./google-services.json")),
});

// Send a Push Notification
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

module.exports = { sendPushNotification };
