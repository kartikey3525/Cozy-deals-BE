

const { User } = require("../../user/models/user.model");
const { ChatApp } = require("../models/chatApp.model");
const { ChatContact } = require("../models/contact.model");
const { isValid } = require("../../../middleware/validator.middleware");
const { msg } = require("../../../../config/message");
const mongoose = require("mongoose");

// =======================
// Event handler for connecting sockets
const connect = async (io, socket) => {
  try {
    // Update online status of connected user
    const updateOnlineStatus = await User.findByIdAndUpdate(
      socket.user._id,
      { $set: { isOnline: true, socketId: socket.id } },
      { new: true }
    );

    io.emit("userStatusChanged", {
      userId: socket.user._id,
      isOnline: true,
    });

    //   // List all connected socket IDs
    // const connectedUsers = Array.from(io.sockets.keys());
    // console.log("Connected users:", connectedUsers, "================================================");

    console.log("User connected", socket.id, "socket.id");
  } catch (error) {
    console.log(error.message);
    socket.emit("error", { msg: error.message });
  }
};

// =======================
// Event handler for user list
const userList = async (io, socket, data) => {
  // data = {key: "search key"} optional
  try {
    let filter = {
      isDeleted: false,
      isVerified: true,
      isDeactivated: false,
      _id: { $ne: socket.user._id },
    };
    if (isValid(data.key)) filter.$or = [{ name: new RegExp(data.key, "i") }];
    const allUser = await User.find(filter).select(
      "name profile roleId role isAdminVerified lastSeen isOnline"
    );

    socket.emit("userList", {
      msg: msg.success,
      count: allUser.length,
      data: allUser,
    });
  } catch (error) {
    console.log(error.message);
    socket.emit("error", { msg: error.message });
  }
};

// =======================
// Event handler for create chat
const createChat = async (io, socket, data) => {
  // data = {userId: "6777999e3153e4016c5eca88"}
  try {
    // Check if userId is provided in the data
    if (!isValid(data.userId)) {
      return socket.emit("error", {
        msg: "UserId is required",
      });
    }

    let chatmsg = await ChatContact.findOne({
      $or: [
        { user1: socket.user._id, user2: data.userId },
        { user1: data.userId, user2: socket.user._id },
      ],
    });

    if (!chatmsg) {
      chatmsg = await ChatContact.create({
        user1: socket.user._id,
        user2: data.userId,
      });
      let msg1 = await ChatApp.create({ chatId: chatmsg._id });
    }

    let msgData =
    await msgDataFn(
        io,
        socket,
        chatmsg._id,
    );    // leaving all room, before joining any room
    socket.rooms.forEach((roomId) => {
      if (roomId !== socket.id) {
        // Avoid leaving the default room with the socket's own ID
        socket.leave(roomId);
        console.log(`Socket ${socket.id} left room ${roomId}`);
      }
    });
    socket.join(chatmsg._id.toString());

    socket.emit("openChat", {
      msg: msg.success,
      data: chatmsg,
      msgData: msgData,
    });
  } catch (error) {
    console.log(error.message);
    socket.emit("error", { msg: error.message });
  }
};

// =======================
// Event handler for view all chat list
const chatList = async (io, socket, data) => {
  try {
    const list = await ChatContact.aggregate([
      {
        $match: {
          $or: [
            { user1: new mongoose.Types.ObjectId(socket.user._id) },
            { user2: new mongoose.Types.ObjectId(socket.user._id) },
          ],
        },
      },
      {
        $addFields: {
          chatWithUser: {
            $cond: {
              if: {
                $ne: ["$user1", new mongoose.Types.ObjectId(socket.user._id)],
              }, // Check if user1 is not equal to socket.user._id
              then: "$user1", // Assign user1
              else: "$user2", // Otherwise, assign user2
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          let: { id: "$chatWithUser" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
            {
              $project: {
                name: 1,
                profile: 1,
                roleId: 1,
                role: 1,
                isAdminVerified: 1,
                lastSeen: 1,
                isOnline: 1,
              },
            },
          ],
          as: "chatWithUser",
        },
      },
      {
        $unwind: "$chatWithUser",
      },
      {
        $lookup: {
          from: "chatmessages",
          localField: "_id",
          foreignField: "chatId",
          as: "messages",
        },
      },
      {
        $addFields: {
          messageDoc: {
            $arrayElemAt: ["$messages", 0],
          },
        },
      },
      {
        $addFields: {
          lastMessage: {
            $arrayElemAt: ["$messageDoc.message", -1],
          },
        },
      },
      {
        $project: {
          chatWithUser: 1,
          chatType: 1,
          isBlocked: 1,
          lastMessage: 1,
          updatedAt: "$messageDoc.updatedAt",
        },
      },
    ]);
    list.sort((a, b) => {
      return (
        new Date(b.updatedAt || 0) -
        new Date(a.updatedAt || 0)
      );
    });
    socket.emit("chatList", {
      msg: msg.success,
      count: list.length,
      data: list,
    });
  } catch (error) {
    console.log(error.message);
    socket.emit("error", { msg: error.message });
  }
};

// =======================
// Event handler for open chat
const openChat = async (io, socket, data) => {
  // data = {id: "6777999e3153e4016c5eca88"}
  try {
    // Check if id is provided in the data
    if (!isValid(data.id)) {
      return socket.emit("error", {
        msg: "id is required",
      });
    }
    const chatmsg = await ChatContact.findById(data.id);

    let msgData = await msgDataFn(
      io,
      socket,
      chatmsg._id,
  )
    // leaving all room, before joining any room
    socket.rooms.forEach((roomId) => {
      if (roomId !== socket.id) {
        // Avoid leaving the default room with the socket's own ID
        socket.leave(roomId);
        console.log(`Socket ${socket.id} left room ${roomId}`);
      }
    });

    socket.join(chatmsg._id.toString());

    socket.emit("openChat", {
      msg: msg.success,
      data: chatmsg,
      msgData: msgData,
    });
  } catch (error) {
    console.log(error.message);
    socket.emit("error", { msg: error.message });
  }
};

// =======================
// Event handler for open chat
const sendMsg = async (io, socket, data, callback) => {
  // data = {"chatId": "678603c9676b7bd9de28d6d5", "msg": "Hello, how are you?", "msgType": "text", "thumbnail": ""}
  try {
    // Check if id is provided in the data
    if (!isValid(data.chatId)) {
      return socket.emit("error", {
        msg: "chatId is required",
      });
    }
    data.clientMessageId =
    data.clientMessageId ||
    `server_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  
  data.senderId = socket.user._id;
  
  data.createdAt = new Date();
    // data.readBy = [
    //   {
    //     userId: socket.user._id,
    //     status: "read",
    //   },
    // ];
    data.readBy = [];
    const chatmsg = await ChatApp.findOneAndUpdate(
      { chatId: data.chatId },
      {
        $push: {
          message: data,
        },
        $set: {
          updatedAt: new Date(),
        },
      },
      {
        new: true,
      }
    ).populate("chatId", "user1 user2");
    
    if (!chatmsg) {
      return socket.emit("error", {
        msg: "Chat not found",
      });
    }
  
    const savedMessage = {
      ...chatmsg.message[
          chatmsg.message.length - 1
      ].toObject(),
  
      clientMessageId: data.clientMessageId,
  
      senderId: socket.user._id,
  
      createdAt:
          chatmsg.message[
              chatmsg.message.length - 1
          ].createdAt ||
          chatmsg.message[
              chatmsg.message.length - 1
          ].date,
  
      status: "sent",
  };
  
  io.to(data.chatId).emit("receiveMsg", {
      msg: msg.success,
      data: savedMessage,
  });

  io.to(data.chatId).emit("chatUpdated", {
    chatId: data.chatId,
    lastMessage: savedMessage,
  });

  console.log(
    "📨 Emitting Delivered:",
    savedMessage.clientMessageId
);

  io.to(data.chatId).emit("messageDelivered", {
    clientMessageId: savedMessage.clientMessageId,
    status: "delivered",
});

const clients = io.sockets.adapter.rooms.get(data.chatId);

if (clients && clients.size >= 2) {
  await ChatApp.updateOne(
    {
      chatId: data.chatId,
      "message._id": savedMessage._id,
    },
    {
      $addToSet: {
        "message.$.readBy": {
          userId: chatmsg.chatId.user1.equals(socket.user._id)
            ? chatmsg.chatId.user2
            : chatmsg.chatId.user1,
          status: "read",
          date: new Date(),
        },
      },
    },
  );

  savedMessage.readBy = [
    {
      userId:
        chatmsg.chatId.user1.equals(socket.user._id)
          ? chatmsg.chatId.user2
          : chatmsg.chatId.user1,
      status: "read",
      date: new Date(),
    },
  ];

  io.to(data.chatId).emit("messageRead", {
    messageId: savedMessage._id,
    clientMessageId: savedMessage.clientMessageId,
    readBy: savedMessage.readBy,
  });
}

  if (typeof callback === "function") {
    callback({
        success: true,
        message: savedMessage,
    });
}
    // const clientsInRoom = Array.from(io.adapter.rooms.get(data.chatId) || []);
    // if (clientsInRoom.length > 1) {
    //   let chatWithUsers;
    //   if (chatmsg.chatId.user1.toString() == socket.user._id.toString()) {
    //     chatWithUsers = chatmsg.chatId.user2;
    //   } else {
    //     chatWithUsers = chatmsg.chatId.user1;
    //   }
    //   let socketId1 = await User.findById(chatWithUsers).select("socketId");
    //   for (let i = 0; i < clientsInRoom.length - 1; i++) {
    //     if (clientsInRoom[i] == socketId1.socketId) {
    //       data.readBy.push({
    //         userId: socketId1._id,
    //         status: "read",
    //       });
    //       const chatmsg11 = await ChatApp.updateOne(
    //         {
    //           chatId: data.chatId,
    //           "message.readBy.userId": { $ne: socketId1._id }, // Ensure userId is not already in readBy
    //         },
    //         {
    //           $addToSet: { "message.$[].readBy": { userId: socketId1._id } },
    //           // Add to readBy if userId does not already exist
    //         },
    //         { new: true }
    //       );
    //     }
    //   }
    // }
    // console.log(
    //   "Users in room:",
    //   clientsInRoom,
    //   "==========================================="
    // );

  } catch (error) {
    if (typeof callback === "function") {
      callback({
          success: false,
          message: error.message,
      });
  }
    console.log(error.message);
    socket.emit("error", { msg: error.message });
  }
};

// =======================
// Event handler for typing
const isTyping = async (io, socket, data) => {
  // data = {"chatId": "678603c9676b7bd9de28d6d5", isTyping: true // true, false}
  try {
    // Check if id is provided in the data
    if (!isValid(data.chatId) || !isValid(data.isTyping)) {
      return socket.emit("error", {
        msg: "chatId and typing status are required",
      });
    }

    data.userId = socket.user._id;

    io.to(data.chatId).emit("isTyping", {
      msg: msg.success,
      data: data,
    });
  } catch (error) {
    console.log(error.message);
    socket.emit("error", { msg: error.message });
  }
};

// =======================
// Event handler for delete msg
const deleteMsg = async (io, socket, data) => {
  // data = {"chatId": "678603c9676b7bd9de28d6d5", "msgId": "678603c9676b7bd9de28d6d5"}
  try {
    if (!isValid(data.chatId) || !isValid(data.msgId)) {
      return socket.emit("error", {
        msg: "chatId and msgId is required",
      });
    }
    const chatmsg = await ChatApp.updateOne(
      {
        chatId: data.chatId,
        "message._id": data.msgId,
        "message.deleteBy.userId": { $ne: socket.user._id }, // Ensure userId is not already in deleteBy
      },
      {
        $addToSet: { "message.$.deleteBy": { userId: socket.user._id } },
        // Add only if it doesn't exist
      },
      { new: true }
    );
  } catch (error) {
    console.log(error.message);
    socket.emit("error", { msg: error.message });
  }
};

// =======================
// Event handler for clear chat messages
const clearChat = async (io, socket, data) => {
  // data = {"chatId": "678603c9676b7bd9de28d6d5"}
  try {
    if (!isValid(data.chatId)) {
      return socket.emit("error", {
        msg: "chatId is required",
      });
    }
    const chatmsg = await ChatApp.updateOne(
      {
        chatId: data.chatId,
        "message.deleteBy.userId": { $ne: socket.user._id }, // Ensure userId is not already in deleteBy
      },
      {
        $addToSet: { "message.$[].deleteBy": { userId: socket.user._id } },
        // Add to deleteBy if userId does not already exist
      },
      { new: true }
    );
  } catch (error) {
    console.log(error.message);
    socket.emit("error", { msg: error.message });
  }
};

// =======================
// Event handler for block or unblock user
const blockUnblock = async (io, socket, data) => {
  // data = {"chatId": "678603c9676b7bd9de28d6d5", status: "unblock" // block, unblock}
  try {
    if (!isValid(data.chatId) || !isValid(data.status)) {
      return socket.emit("error", {
        msg: "chatId and status are required",
      });
    }
    if (isValid(data.status) && data.status == "block") {
      const block = await ChatContact.updateOne(
        {
          _id: data.chatId,
          "blockBy.userId": { $ne: socket.user._id }, // Ensure userId is not already in blockBy
        },
        {
          $addToSet: { blockBy: { userId: socket.user._id } },
          // Add to blockBy if userId does not already exist
          $set: { isBlocked: true }, // Set isBlocked to true
        },
        { new: true }
      );
    } else if (isValid(data.status) && data.status == "unblock") {
      const block = await ChatContact.findByIdAndUpdate(
        {
          _id: data.chatId,
        },
        {
          $pull: { blockBy: { userId: socket.user._id } },
        },
        { new: true }
      );
      if (block.blockBy.length == 0) block.isBlocked = false;
      await block.save();
    }
  } catch (error) {
    console.log(error.message);
    socket.emit("error", { msg: error.message });
  }
};

// =======================
// Event handler for disconnecting sockets
const disconnect = async (io, socket) => {
  try {
    // Update online status of disconnected user
    const updateOnlineStatus = await User.findByIdAndUpdate(
      socket.user._id,
      { $set: { isOnline: false, lastSeen: new Date() } },
      { new: true }
    );
    io.emit("userStatusChanged", {
      userId: socket.user._id,
      isOnline: false,
      lastSeen: new Date(),
    });
    console.log("User disconnected", socket.id, "socket.id");
  } catch (error) {
    console.log(error.message);
    socket.emit("error", { msg: error.message });
  }
};

// ======================= function =================

const msgDataFn = async (
  io,
  socket,
  chatId,
) => {
  try {
    await ChatApp.updateOne(
      { chatId },
      {
        $addToSet: {
          "message.$[msg].readBy": {
            userId: socket.user._id,
            status: "read",
            date: new Date(),
          },
        },
      },
      {
        arrayFilters: [
          {
            "msg.senderId": {
              $ne: new mongoose.Types.ObjectId(socket.user._id),
            },
          },
        ],
      }
    );

    let data = await ChatApp.aggregate([
      {
        $match: { chatId: chatId },
      },
      {
        $unwind: "$message",
      },
      {
        $project: {
          chatId: 1,
          message: 1,
          _id: 0,
        },
      },
      { $replaceRoot: { newRoot: "$message" } },
    ]);

    io.to(chatId.toString()).emit("messageRead", {
      userId: socket.user._id,
    });

    return data;
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  connect,
  disconnect,
  userList,
  openChat,
  createChat,
  sendMsg,
  deleteMsg,
  clearChat,
  chatList,
  blockUnblock,
  isTyping,
};
