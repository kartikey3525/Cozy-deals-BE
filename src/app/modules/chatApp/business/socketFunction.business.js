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

    let msgData = await msgDataFn(socket, chatmsg._id);

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

    let msgData = await msgDataFn(socket, chatmsg._id);

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
const sendMsg = async (io, socket, data) => {
  // data = {"chatId": "678603c9676b7bd9de28d6d5", "msg": "Hello, how are you?", "msgType": "text", "thumbnail": ""}
  try {
    // Check if id is provided in the data
    if (!isValid(data.chatId)) {
      return socket.emit("error", {
        msg: "chatId is required",
      });
    }
    data.senderId = socket.user._id;
    data.readBy = [
      {
        userId: socket.user._id,
        status: "read",
      },
    ];
    const chatmsg = await ChatApp.findOneAndUpdate(
      { chatId: data.chatId },
      { $push: { message: data } },
      { new: true }
    );

    io.to(data.chatId).emit("receiveMsg", {
      msg: msg.success,
      data: data,
    });
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
    console.log("User disconnected", socket.id, "socket.id");
  } catch (error) {
    console.log(error.message);
    socket.emit("error", { msg: error.message });
  }
};

// ======================= function =================

const msgDataFn = async (socket, chatId) => {
  try {
    let data = await ChatApp.aggregate([
      {
        $match: { chatId: chatId },
      },
      {
        $unwind: "$message",
      },
    ]);

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
};
