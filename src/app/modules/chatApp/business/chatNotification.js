// const admin = require("firebase-admin");
// var serviceAccount = require("../tad_service_account.json");
// const { getMessaging } = require("firebase-admin/messaging");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });
// const notification_options = {
//   priority: "high",
//   timeToLive: 60  60  24,
// };

// exports.sendNotification = async (
//   title,
//   body,
//   notificationData,
//   registrationTokens
// ) => {
//   try {
//     // const message = {
//     //   tokens: registrationTokens,
//     //   data: {
//     //     title,
//     //     body,
//     //   },
//     // };
//     let extensionType ; 
//         let array = body.split(".")
//         if(notificationData?.imagurl){
//           extensionType = "image"
//         }
//         let extension = array[array.length-1]
//         console.log("extension======>>>>>>>", extension)
//         if(extension ==="jpg" || extension==="png" || extension ==="jpeg"){
//           extensionType ="image";
//           console.log("extension from pass condition====>>>>>", extensionType )
//         }
//         console.log("extension from outside condition====>>>>>", extensionType )
//         if(extensionType){
//           notificationData = notificationData?notificationData:{};
//           notificationData["type"]=extensionType;
//         }
//     const message = {
//       notification: {
//         title,
//         body,
//       },
//       data: {
//         ...notificationData,
//       },
//       tokens: registrationTokens,
//     };

//     console.log(message)

//     const messages = await getMessaging().sendEachForMulticast(message);
//     // console.log(JSON.stringify(messages))
//     return messages;
//   } catch (error) {
//     console.log(error);
//   }
// };

// exports.sendAllMultiNotification = async (req, res) => {
//   try {
//     const { title, body, registrationTokens, userIds } = req.body;
//     let messages = await this.sendNotification(title, body, registrationTokens);
//     // const notification = await Notification.create({
//     //   title,
//     //   body,
//     //   userIds
//     // })
//     // await notification.save()
//     return res.status(200).json({ message: messages });
//   } catch (error) {
//     return res.status(500).json({
//       message: error.toString(),
//     });
//   }
// };


// ============================================================

// const fs = require("fs");
// const path = require('path');
// var FCM = require('fcm-node');


// const sendPushNotification = async(userId,message) => {

//     try {
  
//       console.log('User Id:- '+userId);
//       console.log('message:- '+message);
  
//       fs.readFile(path.join(__dirname,'../FireBaseConfig.json'), "utf8", async(err, jsonString) => {
//       if (err) {
//           console.log("Error reading file from disk:", err);
//           return err;
//         }
//         try {
  
//           //firebase push notification send
//           const data = JSON.parse(jsonString);
//           var serverKey = data.SERVER_KEY;
//           var fcm = new FCM(serverKey);
  
//           var push_tokens = await Push_Notification.find({ 
//             where:{
//               user_id:userId
//             }
//           });
          
//           var reg_ids = [];
//           push_tokens.forEach(token => {
//             reg_ids.push(token.fcm_token)
//           })
  
//           if(reg_ids.length > 0){
  
//             var pushMessage = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
//               registration_ids:reg_ids,
//               content_available: true,
//               mutable_content: true,
//               notification: {
//                   body: message,
//                   icon : 'myicon',//Default Icon
//                   sound : 'mySound',//Default sound
//                   // badge: badgeCount, example:1 or 2 or 3 or etc....
//               },
//               // data: {
//               //   notification_type: 5,
//               //   conversation_id:inputs.user_id,
//               // }
//             };
          
//             fcm.send(pushMessage, function(err, response){
//                 if (err) {
//                     console.log("Something has gone wrong!",err);
//                 } else {
//                     console.log("Push notification sent.", response);
//                 }
//             });
  
//           }
  
  
//         } catch (err) {
//           console.log("Error parsing JSON string:", err);
//         }
//       });
  
//     } catch (error) {
//       console.log(error);
//     }
  
//   }