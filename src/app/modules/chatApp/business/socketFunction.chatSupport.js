const { User } = require("../../user/models/user.model");
const { ChatSupport } = require("../models/chatSupport.model");
const { isValid } = require("../../../middleware/validator.middleware");
const { msg } = require("../../../../config/message");
const mongoose = require("mongoose");

// =======================
// Event handler for open chat (if admin open chat support of any user then send _id of document)
const openChat = async (io, socket, data) => {
  // {id: "678603c9676b7bd9de28d6d5"}
  try {
    let chatmsg;
    if (isValid(data.id)) {
      chatmsg = await ChatSupport.findById(data.id);
    } else {
      chatmsg = await ChatSupport.findOneAndUpdate(
        { userId: socket.user._id },
        {},
        { new: true, upsert: true }
      );
    }

    socket.join(chatmsg._id.toString());

    socket.emit("openChat", {
      msg: msg.success,
      data: chatmsg,
    });
  } catch (error) {
    console.log(error.message);
    socket.emit("error", { msg: error.message });
  }
};

// =======================
// Event handler for send msg
const sendMsg = async (io, socket, data) => {
  // data = {"id": "678603c9676b7bd9de28d6d5", "msg": "Hello, how are you?", "msgType": "text", "thumbnail": ""}
  try {
    // Check if id is provided in the data
    if (!isValid(data.id)) {
      return socket.emit("error", {
        msg: "id is required",
      });
    }
    data.senderId = socket.user._id;
    const chatmsg = await ChatApp.updateOne(
      { _id: data.id },
      { $push: { message: data } },
      { new: true }
    );

    io.to(data.id).emit("receiveMsg", {
      msg: msg.success,
      data: data,
    });
  } catch (error) {
    console.log(error.message);
    socket.emit("error", { msg: error.message });
  }
};

// =======================
// Event handler for chat support list // this handler for admin only
const chatSupportList = async (io, socket, data) => {
  try {
    socket.join(chatmsg._id.toString());

    socket.emit("chatSupportList", {
      msg: msg.success,
      data: socket.user,
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
    console.log("User disconnected", socket.id, "socket.id");
  } catch (error) {
    console.log(error.message);
    socket.emit("error", { msg: error.message });
  }
};

module.exports = {
  disconnect,
  openChat,
  sendMsg,
  chatSupportList,
};
