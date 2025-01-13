const { User } = require("../../user/models/user.model");
const { ChatApp } = require("../models/chatApp.model");
const { ChatContact } = require("../models/contact.model");
const mongoose = require("mongoose");

// Store mapping between user tokens and socket IDs
const connectedUser = new Map();
const viewSingleChat = new Map();
const viewSingleChatWith = new Map();

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
  }
};

// ========================
// Event handler for sending chat messages
const sendChatMessage = async (io, socket, data) => {
  try {
    //data : {id: 662b4f7b72975e3f85cfb169 (_id), message: "hii", type: "text"}
    let sendDetail = {};
    let receiveDetail = {};

    // Determine the type of message being sent (text, image, sound)
    sendDetail.msg = data.message;
    sendDetail.type = data.type;
    sendDetail.msgStatus = "send";
    sendDetail.date = new Date();
    if (data.file) {
      (sendDetail.file = data.file), (receiveDetail.file = data.file);
    }
    if (data.thumbnail) {
      (sendDetail.thumbnail = data.thumbnail),
        (receiveDetail.thumbnail = data.thumbnail);
    }
    receiveDetail.msg = data.message;
    receiveDetail.type = data.type;
    receiveDetail.msgStatus = "receive";
    receiveDetail.date = new Date();
    let createId = new IdCreate({ name: "faltu" });
    sendDetail._id = createId._id;
    receiveDetail._id = createId._id;
    viewSingleChatWith.delete(socket.chatData.id);

    // Find or create a chat app entry for the sender
    let sender = await ChatApp.findOne({ _id: data.id });
    let chatWithSocket;
    if (sender.chatType == "single")
      chatWithSocket = sender.chatWith.toString();
    else if (sender.chatType == "group")
      chatWithSocket = sender.groupId.toString();
    viewSingleChatWith.set(socket.chatData.id, chatWithSocket);

    sendDetail.id = sender.sender;
    receiveDetail.id = sender.sender;
    if (sender && sender.chatType == "single") {
      let senderUpdateStatus = false;
      sender.unReadMessage.push(sendDetail);
      await sender.save();
      if (sender && sender.isBlocked === false) {
        senderUpdateStatus = true;
      }

      let chatWith;
      // Find or create a chat app entry for the receiver
      let chatWithUpdateStatus = false;
      if (senderUpdateStatus === true) {
        chatWith = await ChatApp.findOne({
          chatWith: sender.sender,
          chatId: sender.chatId,
        });
        if (chatWith && chatWith.isBlocked === false) {
          chatWith.unReadMessage.push(receiveDetail);
          await chatWith.save();
          chatWithUpdateStatus = true;
        } else if (!chatWith) {
          chatWith = await ChatApp.create({
            sender: sender.chatWith,
            chatWith: sender.sender,
            chatId: sender.chatId,
            schoolId: sender.schoolId,
            unReadMessage: [receiveDetail],
          });
          chatWithUpdateStatus = true;
        }
      }

      let chatWithIsOnline = false;
      // Emit chat message to corresponding sockets
      const chatWithSocketWhichIdOpen = viewSingleChatWith.get(
        sender.chatWith.toString()
      );
      if (chatWithUpdateStatus === true) {
        if (!chatWithSocketWhichIdOpen) {
          await functionOfViewChatMessage(io, sender.chatWith.toString());
        } else if (chatWithSocketWhichIdOpen == socket.chatData.id) {
          chatWith = await ChatApp.findOne({
            chatWith: sender.sender,
            chatId: sender.chatId,
          })
            .populate("chatWith", "name isOnline lastSeen profile")
            .populate("message.id", "name profile")
            .populate("unReadMessage.id", "name profile");
          chatWith.message = chatWith.message.push(...chatWith.unReadMessage);
          let sendChatWithData = {
            _id: chatWith._id,
            chatWith: chatWith.chatWith,
            message: chatWith.message,
            chatType: chatWith.chatType,
            isTyping: chatWith.isTyping,
          };
          let chatSocketId = connectedUser.get(sender.chatWith.toString());
          io.to(chatSocketId).emit("viewSingleChat", {
            msg: "ok",
            result: sendChatWithData,
          });
          chatWithIsOnline = true;
        }
      }
      let msg = "ok";
      let senderSocketId = connectedUser.get(socket.chatData.id);
      if (chatWithIsOnline === true) {
        if (sender || sender.unReadMessage.length > 0) {
          let read = new UnReadToRead({ message: sender.unReadMessage });
          sender.message.push(...read.message);
          sender.unReadMessage = [];
          sender = await sender.save();
        }
        sender = await ChatApp.findOne({ _id: data.id })
          .populate("chatWith", "name isOnline lastSeen profile")
          .populate("message.id", "name profile")
          .populate("unReadMessage.id", "name profile");
        let sendChatData = {
          _id: sender._id,
          chatWith: sender.chatWith,
          message: sender.message,
          chatType: sender.chatType,
          isTyping: sender.isTyping,
        };
        io.to(senderSocketId).emit("viewSingleChat", {
          msg: msg,
          result: sendChatData,
        });
      } else {
        sender = await ChatApp.findOne({ _id: data.id })
          .populate("chatWith", "name isOnline lastSeen profile")
          .populate("message.id", "name profile")
          .populate("unReadMessage.id", "name profile");
        if (sender || sender.unReadMessage.length > 0) {
          sender.message.push(...sender.unReadMessage);
        }
        let sendChatData = {
          _id: sender._id,
          chatWith: sender.chatWith,
          message: sender.message,
          chatType: sender.chatType,
          isTyping: sender.isTyping,
        };
        if (sender.isBlocked === true) msg = "unblock this chat";
        io.to(senderSocketId).emit("viewSingleChat", {
          msg: msg,
          result: sendChatData,
        });
      }
    } else if (sender && sender.chatType == "group") {
      sendDetail.readStatus = false;
      sender.message.push(sendDetail);
      await sender.save();

      receiveDetail.readStatus = false;

      const groupChatUpdate = await ChatApp.updateMany(
        {
          groupId: sender.groupId,
          chatType: sender.chatType,
          sender: { $ne: sender.sender },
        },
        { $push: { message: receiveDetail } }
      );

      let chat = await ChatApp.findOne({ _id: sender._id })
        .populate("chatWith", "name isOnline lastSeen profile")
        .populate("message.id", "name profile")
        .populate("unReadMessage.id", "name profile")
        .populate("groupId", "name profile")
        .lean();

      if (chat && chat.unReadMessage.length > 0)
        chat.message.push(...chat.unReadMessage);

      viewSingleChatWith.set(socket.chatData.id, chat.groupId._id.toString());
      // Emit chat messages to the corresponding socket
      const chatSocketId = connectedUser.get(socket.chatData.id);

      chat.groupId.isOnline = false;
      chat.groupId.lastSeen = "";
      let sendChatData = {
        _id: chat._id,
        chatWith: chat.groupId,
        message: chat.message,
        chatType: chat.chatType,
        isTyping: chat.isTyping,
      };

      io.to(chatSocketId).emit("viewSingleChat", {
        msg: "ok",
        result: sendChatData,
      });

      //emit chat to other user of a group
      await emitGroupChat(io, chat.groupId._id.toString(), chat.sender);
    }
  } catch (error) {
    console.log(error.message);
  }
};

// ====================
// Event handler for viewing single chat messages
const viewSingleChatFn = async (io, socket, data) => {
  //data : {id: 3 / "660a75e7dd2eebfca0329a24" (_id)}
  try {
    viewSingleChatWith.delete(socket.chatData.id);

    let chat;
    let findInChatApp = false;

    chat = await ChatApp.findOne({ _id: data.id })
      .populate("chatWith", "name isOnline lastSeen profile")
      .populate("message.id", "name profile")
      .populate("unReadMessage.id", "name profile");

    if (!chat) {
      chat = await ChatApp.findOne({
        sender: socket.chatData.id,
        chatWith: data.id,
      });
      if (!chat) {
        let data1 = {
          user1: socket.chatData.id,
          user2: data.id,
          schoolId: socket.user.school,
        };
        let data2 = {
          user1: data.id,
          user2: socket.chatData.id,
          schoolId: socket.user.school,
        };

        let chatid = await ChatId.findOne({ $or: [data1, data2] });
        if (!chatid) chatid = await ChatId.create(data1);

        chat = await ChatApp.create({
          sender: socket.chatData.id,
          chatWith: data.id,
          chatId: chatid._id,
          schoolId: socket.user.school,
        });
      }
      data.id = chat._id;
    }

    findInChatApp = true;
    if (
      chat &&
      chat.unReadMessage.length > 0 &&
      chat.unReadMessage[0].msgStatus == "receive"
    ) {
      let read = new UnReadToRead({ message: chat.unReadMessage });
      chat.message.push(...read.message);
      chat.unReadMessage = [];
      chat = await chat.save();
    }
    chat = await ChatApp.findOne({ _id: data.id })
      .populate("chatWith", "name isOnline lastSeen profile")
      .populate("message.id", "name profile")
      .populate("unReadMessage.id", "name profile")
      .populate("groupId", "name profile")
      .lean();
    if (chat && chat.unReadMessage.length > 0)
      chat.message.push(...chat.unReadMessage);
    let chatWithSocket;
    if (chat.chatType == "single")
      chatWithSocket = chat.chatWith._id.toString();
    else if (chat.chatType == "group")
      chatWithSocket = chat.groupId._id.toString();
    viewSingleChatWith.set(socket.chatData.id, chatWithSocket);
    // Emit chat messages to the corresponding socket
    const chatSocketId = connectedUser.get(socket.chatData.id);

    let sendChatData;
    if (chat.chatType == "single") {
      sendChatData = {
        _id: chat._id,
        chatWith: chat.chatWith,
        message: chat.message,
        chatType: chat.chatType,
        isTyping: chat.isTyping,
      };
    } else {
      chat.groupId.isOnline = false;
      chat.groupId.lastSeen = "";
      sendChatData = {
        _id: chat._id,
        chatWith: chat.groupId,
        message: chat.message,
        chatType: chat.chatType,
        isTyping: chat.isTyping,
      };
    }
    io.to(chatSocketId).emit("viewSingleChat", {
      msg: "ok",
      result: sendChatData,
    });
    console.log("=====viewSingleChat", chatSocketId);
    if (findInChatApp == true && chat.chatType == "single") {
      let chatWithChat = await ChatApp.findOne({
        sender: chat.chatWith._id,
        chatId: chat.chatId,
      });
      if (
        chatWithChat &&
        chatWithChat.unReadMessage.length > 0 &&
        chatWithChat.unReadMessage[0].msgStatus == "send"
      ) {
        let read = new UnReadToRead({ message: chatWithChat.unReadMessage });
        chatWithChat.message.push(...read.message);
        chatWithChat.unReadMessage = [];
        await chatWithChat.save();

        let chatWithChatOnline = connectedUser.get(
          chat.chatWith._id.toString()
        );
        let chatWithOpenChat = viewSingleChatWith.get(
          chat.chatWith._id.toString()
        );

        if (chatWithChatOnline && chatWithOpenChat == socket.chatData.id) {
          chatWithChat = await ChatApp.findOne({
            sender: chat.chatWith._id,
            chatId: chat.chatId,
          })
            .populate("chatWith", "name isOnline lastSeen profile")
            .populate("message.id", "name profile")
            .populate("unReadMessage.id", "name profile")
            .populate("groupId", "name profile")
            .lean();

          if (chatWithChat && chatWithChat.unReadMessage.length > 0)
            chatWithChat.message.push(...chatWithChat.unReadMessage);

          let sendChatData = {
            _id: chatWithChat._id,
            chatWith: chatWithChat.chatWith,
            message: chatWithChat.message,
            chatType: chatWithChat.chatType,
            isTyping: chatWithChat.isTyping,
          };
          io.to(chatWithChatOnline).emit("viewSingleChat", {
            msg: "ok",
            result: sendChatData,
          });
        }
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

// =======================
// Event handler for clear chat messages
const clearChatMessage = async (io, socket, data) => {
  //data : {id: "6631d306d045a7532367bb5a" (_id)}
  try {
    viewSingleChatWith.delete(socket.chatData.id);
    const { id } = data;

    // clear the message from the database
    let chat = await ChatApp.findById(id);
    if (chat) {
      chat.message = [];
      chat.unReadMessage = [];
      chat = await chat.save();
    }

    chat = await ChatApp.findOne({ _id: id })
      .populate("chatWith", "name isOnline lastSeen profile")
      .populate("message.id", "name profile")
      .populate("unReadMessage.id", "name profile")
      .populate("groupId", "name profile")
      .lean();

    let chatWithSocket;
    if (chat.chatType == "single")
      chatWithSocket = chat.chatWith._id.toString();
    else if (chat.chatType == "group") chatWithSocket = chat.groupId.toString();
    viewSingleChatWith.set(socket.chatData.id, chatWithSocket);
    // Emit chat messages to the corresponding socket
    const chatSocketId = connectedUser.get(socket.chatData.id);

    let sendChatData;
    if (chat.chatType == "single") {
      sendChatData = {
        _id: chat._id,
        chatWith: chat.chatWith,
        message: chat.message,
        chatType: chat.chatType,
        isTyping: chat.isTyping,
      };
    } else {
      chat.groupId.isOnline = false;
      chat.groupId.lastSeen = "";
      sendChatData = {
        _id: chat._id,
        chatWith: chat.groupId,
        message: chat.message,
        chatType: chat.chatType,
        isTyping: chat.isTyping,
      };
    }
    io.to(chatSocketId).emit("viewSingleChat", {
      msg: "ok",
      result: sendChatData,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// =======================
// Event handler for block or unblock chat
const blockUnblockChat = async (io, socket, data) => {
  //data : {id: "6631d306d045a7532367bb5a" (_id)}
  try {
    const { id } = data;

    // block or unblock chat
    let senderChat = await ChatApp.findById(id);

    let status;

    if (senderChat.isBlocked === false) {
      senderChat.isBlocked = true;
      senderChat.blockUnblockDate = new Date();
      status = "block";
      senderChat = await senderChat.save();
    } else {
      senderChat.isBlocked = false;
      senderChat.blockUnblockDate = new Date();
      status = "unblock";
      senderChat = await senderChat.save();
    }

    if (senderChat.unReadMessage.length > 0)
      senderChat.message.push(...senderChat.unReadMessage);

    // Emit chat message to corresponding sockets
    const senderSocketId = viewSingleChat.get(socket.chatData.id);
    const chatWithSocketId = viewSingleChatWith.get(socket.chatData.id);

    if (senderSocketId && chatWithSocketId == senderChat.chatWith.toString()) {
      io.to(senderSocketId).emit("viewSingleChat", {
        msg: `you ${status} this chat`,
        result: senderChat,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//========================
// Event handler for deleting chat messages
const deleteChatMessage = async (io, socket, data) => {
  //data : {id: "6631d306d045a7532367bb5a" (_id), messageId: "660a75e7dd2eebfca0329a24"}
  try {
    viewSingleChatWith.delete(socket.chatData.id);
    const { id, messageId } = data;

    // Delete the message from the database
    let deleteSingleMsg = await ChatApp.updateOne(
      { _id: id },
      {
        $pull: {
          message: { _id: messageId },
          unReadMessage: { _id: messageId },
        },
      }
    );

    let chat = await ChatApp.findOne({ _id: id })
      .populate("chatWith", "name isOnline lastSeen profile")
      .populate("message.id", "name profile")
      .populate("unReadMessage.id", "name profile")
      .populate("groupId", "name profile")
      .lean();

    let chatWithSocket;
    if (chat.chatType == "single")
      chatWithSocket = chat.chatWith._id.toString();
    else if (chat.chatType == "group")
      chatWithSocket = chat.groupId._id.toString();
    viewSingleChatWith.set(socket.chatData.id, chatWithSocket);
    if (chat && chat.unReadMessage.length > 0)
      chat.message.push(...chat.unReadMessage);
    // Emit chat messages to the corresponding socket
    const chatSocketId = connectedUser.get(socket.chatData.id);

    let sendChatData;
    if (chat.chatType == "single") {
      sendChatData = {
        _id: chat._id,
        chatWith: chat.chatWith,
        message: chat.message,
        chatType: chat.chatType,
        isTyping: chat.isTyping,
      };
    } else {
      chat.groupId.isOnline = false;
      chat.groupId.lastSeen = "";
      sendChatData = {
        _id: chat._id,
        chatWith: chat.groupId,
        message: chat.message,
        chatType: chat.chatType,
        isTyping: chat.isTyping,
      };
    }
    io.to(chatSocketId).emit("viewSingleChat", {
      msg: "ok",
      result: sendChatData,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// =========================
// Event handler for viewing chat messages
const viewChatMessage = async (io, socket) => {
  try {
    // Emit chat messages to the corresponding socket
    // viewSingleChat.delete(socket.chatData.id);
    viewSingleChatWith.delete(socket.chatData.id);
    let chatSocketId = connectedUser.get(socket.chatData.id);
    if (chatSocketId) {
      let chat = await ChatApp.aggregate([
        {
          $match: { sender: socket.chatData._id },
        },
        {
          $lookup: {
            from: "chatcontacts",
            localField: "chatWith",
            foreignField: "_id",
            as: "userDetail",
          },
        },
        {
          $lookup: {
            from: "chatgroups",
            localField: "groupId",
            foreignField: "_id",
            as: "groupDetail",
          },
        },
        {
          $addFields: {
            allMessage: {
              $concatArrays: ["$message", "$unReadMessage"],
            },
            receiveunreadmessage: {
              $filter: {
                input: "$unReadMessage",
                as: "msg",
                cond: { $eq: ["$$msg.msgStatus", "receive"] },
              },
            },
          },
        },
        {
          $addFields: {
            unReadMessageCount: {
              $size: "$receiveunreadmessage",
            },
            lastMessageTime: {
              $cond: {
                if: { $gt: [{ $size: "$unReadMessage" }, 0] },
                then: {
                  $arrayElemAt: [
                    "$unReadMessage.date",
                    { $subtract: [{ $size: "$unReadMessage" }, 1] },
                  ],
                },
                else: "",
              },
            },
            lastMessage: {
              $cond: {
                if: { $gt: [{ $size: "$allMessage" }, 0] },
                then: {
                  $arrayElemAt: [
                    "$allMessage.msg",
                    { $subtract: [{ $size: "$allMessage" }, 1] },
                  ],
                },
                else: "",
              },
            },
            name: {
              $ifNull: [
                { $arrayElemAt: ["$userDetail.name", 0] },
                { $arrayElemAt: ["$groupDetail.name", 0] },
              ],
            },
            profile: {
              $ifNull: [
                { $arrayElemAt: ["$userDetail.profile", 0] },
                { $arrayElemAt: ["$groupDetail.profile", 0] },
              ],
            },
            isOnline: {
              $ifNull: [{ $arrayElemAt: ["$userDetail.isOnline", 0] }, false],
            },
          },
        },
        { $sort: { updatedAt: -1 } },
        {
          $project: {
            _id: 1,
            unReadMessageCount: 1,
            lastMessageTime: 1,
            name: 1,
            profile: 1,
            lastMessage: 1,
            chatType: 1,
            isOnline: 1,
          },
        },
      ]);
      io.to(chatSocketId).emit("viewChatMessage", { msg: "ok", result: chat });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//======================
// Event handler for delete chat
const deleteChat = async (io, socket, data) => {
  //data : {id: "6631d306d045a7532367bb5a" (_id)}
  try {
    const { id } = data;

    // delete chat from the database
    await ChatApp.findByIdAndDelete(id);

    // Emit chat messages to the corresponding socket
    let chatSocketId = connectedUser.get(socket.chatData.id);
    await functionOfViewChatMessage(io, socket.chatData.id.toString());
  } catch (error) {
    console.log(error.message);
  }
};

// ====================
// Event handler for creating group
const createGroup = async (io, socket, data) => {
  //data : {users: [{id: "3", isParent: false}, {id: "3", isParent: true}, {id: "544", isParent: false}](_id), name: "studentGroup of school", profile: "profile.jpg", about: "in this group you receive school important information"} // at one time only 10 user add in a group
  try {
    let groupUser = [];
    let admin = [{ id: socket.chatData.id, name: socket.chatData.name }];
    data.admins = admin;
    data.schoolId = socket.chatData.schoolId;
    let groupChat = await ChatGroup.create(data);
    let userData = data.users;
    for (let i = 0; i < userData.length; i++) {
      if (!userData[i].isParent || userData[i].isParent === false) {
        let user = await ChatContact.findOne({
          userId: userData[i].id,
          isParent: false,
          schoolId: socket.chatData.schoolId,
        });
        if (!user) {
          let findUser = await User.findById(userData[i].id);
          user = await ChatContact.create({
            userId: findUser._id,
            schoolId: findUser.school,
            email: findUser.email,
            name: `${findUser.firstName} ${findUser.lastName}`,
          });
        }
        let findUser = { id: user._id, name: user.name };
        groupUser.push(findUser);
        let chatMessage = await ChatApp.create({
          sender: user._id,
          chatType: "group",
          groupId: groupChat._id,
          schoolId: user.schoolId,
        });
      } else if (userData[i].isParent === true) {
        let findUser = await User.findById(userData[i].id);
        let email;
        if (findUser.fatherInfo.email) email = findUser.fatherInfo.email;
        else email = findUser.motherInfo.email;
        let chatData = await ChatContact.findOne({
          email: email,
          isParent: true,
          schoolId: findUser.school,
        });
        if (!chatData) {
          let name;
          if (findUser.fatherInfo.name) name = findUser.fatherInfo.name;
          else name = findUser.motherInfo.name;
          chatData = await ChatContact.create({
            userId: findUser._id,
            email: email,
            isParent: true,
            schoolId: findUser.school,
            name: name,
          });
        }
        let userParent = { id: chatData._id, name: chatData.name };
        groupUser.push(userParent);
        let chatMessage = await ChatApp.create({
          sender: chatData._id,
          chatType: "group",
          groupId: groupChat._id,
          schoolId: chatData.schoolId,
        });
      }
    }

    let chatMessage = await ChatApp.create({
      sender: socket.chatData.id,
      chatType: "group",
      groupId: groupChat._id,
      schoolId: groupChat.schoolId,
    });

    groupChat.participants = groupUser;
    await groupChat.save();

    chatMessage = await ChatApp.findOne({ _id: chatMessage._id })
      .populate("groupId", "name profile")
      .lean();
    chatMessage.groupId.isOnline = false;
    chatMessage.groupId.lastSeen = "";

    let sendChatData = {
      _id: chatMessage._id,
      chatWith: chatMessage.groupId,
      message: chatMessage.message,
      chatType: chatMessage.chatType,
      isTyping: chatMessage.isTyping,
    };
    let chatSocketId = connectedUser.get(socket.chatData.id);
    io.to(chatSocketId).emit("viewSingleChat", {
      msg: "ok",
      result: sendChatData,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// =====================
// Event handler for making group is private or un private, only admin have allow
const groupPrivate = async (io, socket, data) => {
  //data : {id: "660a75e7dd2eebfca0329a24" (_id)}
  try {
    const { id } = data;

    let chat = await ChatApp.findById(id);
    if (chat.unReadMessage.length > 0) chat.message.push(...chat.unReadMessage);
    let group = await ChatGroup.findById(chat.groupId);
    let groupAdmin = await ChatGroup.aggregate([
      { $match: { _id: chat.groupId } },
      { $unwind: "$admins" },
      { $match: { "admins.id": chat.sender } },
    ]);

    let status;
    if (groupAdmin.length > 0) {
      if (group.is_private === false) {
        group.is_private = true;
        status = "this group is private";
        await group.save();
      } else {
        group.is_private = false;
        status = "this group is not private";
        await group.save();
      }
    } else status = "you have not allowed";

    // Emit chat message to corresponding sockets
    const senderSocketId = viewSingleChat.get(socket.chatData.id);
    const chatWithSocketId = viewSingleChatWith.get(socket.chatData.id);

    if (senderSocketId && chatWithSocketId == chat.groupId.toString()) {
      io.to(senderSocketId).emit("viewSingleChat", {
        msg: status,
        result: chat,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// ======================
// Event handler for add user in a group, only admin have allow to add
const addToGroup = async (io, socket, data) => {
  //data : {users: [{id: "3", isParent: false}, {id: "3", isParent: true}, {id: "544", isParent: false}](_id), id: "660a75e7dd2eebfca0329a24" (_id)} // at one time only 10 user add in a group
  try {
    let groupUser = [];
    let adminData = await ChatApp.findById(data.id);
    let groupChat = await ChatGroup.findById(adminData.groupId);
    let userData = data.users;
    for (let i = 0; i < userData.length; i++) {
      if (!userData[i].isParent || userData[i].isParent === false) {
        let user = await ChatContact.findOne({
          userId: userData[i].id,
          isParent: false,
          schoolId: socket.chatData.schoolId,
        });
        if (!user) {
          let findUser = await User.findById(userData[i].id);
          user = await ChatContact.create({
            userId: findUser._id,
            schoolId: findUser.school,
            email: findUser.email,
            name: `${findUser.firstName} ${findUser.lastName}`,
          });
        }
        let findUser = { id: user._id, name: user.name };
        groupUser.push(findUser);
        let chatMessage = await ChatApp.create({
          sender: user._id,
          chatType: "group",
          groupId: groupChat._id,
          schoolId: user.schoolId,
        });
      } else if (userData[i].isParent === true) {
        let findUser = await User.findById(userData[i].id);
        let email;
        if (findUser.fatherInfo.email) email = findUser.fatherInfo.email;
        else email = findUser.motherInfo.email;
        let chatData = await ChatContact.findOne({
          email: email,
          isParent: true,
          schoolId: findUser.school,
        });
        if (!chatData) {
          let name;
          if (findUser.fatherInfo.name) name = findUser.fatherInfo.name;
          else name = findUser.motherInfo.name;
          chatData = await ChatContact.create({
            userId: findUser._id,
            email: email,
            isParent: true,
            schoolId: findUser.school,
            name: name,
          });
        }
        let userParent = { id: chatData._id, name: chatData.name };
        groupUser.push(userParent);
        let chatMessage = await ChatApp.create({
          sender: chatData._id,
          chatType: "group",
          groupId: groupChat._id,
          schoolId: chatData.schoolId,
        });
      }
    }

    groupChat.participants.push(...groupUser);
    await groupChat.save();
    // Emit chat message to corresponding sockets
    const senderSocketId = viewSingleChat.get(socket.chatData.id);
    const chatWithSocketId = viewSingleChatWith.get(socket.chatData.id);

    if (senderSocketId && chatWithSocketId == chat.groupId.toString()) {
      io.to(senderSocketId).emit("viewSingleChat", {
        msg: "ok",
        result: adminData,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// ========================
// Event handler for audioCall
const audioCall = async (io, socket, data) => {
  try {
    //data : {id: 662b4f7b72975e3f85cfb169 (_id),
    //     "candidate": {
    //         "sdpMid": "data",
    //             "sdp": "candidate:3542374810 1 udp 2122131711 2401:4900:83bb:5a5a:c4f8:fb93:f34c:acdb 64955 typ host generation 0 ufrag UXEN network-id 14 network-cost 900",
    //                 "sdpMLineIndex": 2
    //     }, "type": "candidate"
    // }
    let sendDetail = {};
    let receiveDetail = {};

    // Determine the type of message being sent (text, image, sound, audioCall, videoCall)
    sendDetail.msg = "Audio Call";
    sendDetail.type = "audioCall";
    sendDetail.msgStatus = "send";
    sendDetail.readStatus = false;
    receiveDetail.msg = "Audio Call";
    receiveDetail.type = "audioCall";
    receiveDetail.msgStatus = "receive";
    receiveDetail.readStatus = false;

    let generateId = new UnReadToRead({ message: [receiveDetail] });
    let audioCallId = generateId.message[0]._id;
    sendDetail._id = audioCallId;
    receiveDetail._id = audioCallId;

    // Find a chat app entry for the sender
    let sender = await ChatApp.findOne({ _id: data.id });
    if (sender && sender.chatType == "single") {
      let senderUpdateStatus = false;
      sender.message.push(sendDetail);
      await sender.save();
      if (sender && sender.isBlocked === false) {
        senderUpdateStatus = true;
      }

      let chatWithChatOnline = connectedUser.get(sender.chatWith.toString());
      // let chatWithOpenChat = viewSingleChatWith.get(sender.chatWith.toString());
      if (chatWithChatOnline && senderUpdateStatus == true) {
        let chatWithChat = await ChatApp.findOne({
          sender: sender.chatWith,
          chatId: sender.chatId,
        });
        chatWithChat.message.push(receiveDetail);
        await chatWithChat.save();

        // Notify the callee about the incoming call
        io.to(chatWithChatOnline).emit("incomingAudioCall", {
          msg: "ok",
          result: {
            id: chatWithChat._id,
            candidate: data.candidate,
            type: data.type,
            audioCallId: audioCallId,
          },
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

// ========================
// Event handler for videoCall
const videoCall = async (io, socket, data) => {
  try {
    //data : {id: 662b4f7b72975e3f85cfb169 (_id),
    //     "candidate": {
    //         "sdpMid": "data",
    //             "sdp": "candidate:3542374810 1 udp 2122131711 2401:4900:83bb:5a5a:c4f8:fb93:f34c:acdb 64955 typ host generation 0 ufrag UXEN network-id 14 network-cost 900",
    //                 "sdpMLineIndex": 2
    //     }, "type": "candidate"
    // }
    let sendDetail = {};
    let receiveDetail = {};

    // Determine the type of message being sent (text, image, sound, audioCall, videoCall)
    sendDetail.msg = "Video Call";
    sendDetail.type = "videoCall";
    sendDetail.msgStatus = "send";
    sendDetail.readStatus = false;
    receiveDetail.msg = "Video Call";
    receiveDetail.type = "videoCall";
    receiveDetail.msgStatus = "receive";
    receiveDetail.readStatus = false;

    let generateId = new UnReadToRead({ message: [receiveDetail] });
    let videoCallId = generateId.message[0]._id;
    sendDetail._id = videoCallId;
    receiveDetail._id = videoCallId;

    // Find a chat app entry for the sender
    let sender = await ChatApp.findOne({ _id: data.id });
    if (sender && sender.chatType == "single") {
      let senderUpdateStatus = false;
      sender.message.push(sendDetail);
      await sender.save();
      if (sender && sender.isBlocked === false) {
        senderUpdateStatus = true;
      }

      let chatWithChatOnline = connectedUser.get(sender.chatWith.toString());
      console.log(
        chatWithChatOnline,
        chatWithChatOnline && senderUpdateStatus == true
      );
      // let chatWithOpenChat = viewSingleChatWith.get(sender.chatWith.toString());
      if (chatWithChatOnline && senderUpdateStatus == true) {
        let chatWithChat = await ChatApp.findOne({
          sender: sender.chatWith,
          chatId: sender.chatId,
        });
        chatWithChat.message.push(receiveDetail);
        await chatWithChat.save();

        // Notify the callee about the incoming call
        io.to(chatWithChatOnline).emit("incomingVideoCall", {
          msg: "ok",
          result: {
            id: chatWithChat._id,
            candidate: data.candidate,
            type: data.type,
            videoCallId: videoCallId,
          },
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

// ========================
// Event handler for pickupAudioCall
const pickupAudioCall = async (io, socket, data) => {
  try {
    //data : {id: 662b4f7b72975e3f85cfb169 (_id), "audioCallId": "667d0f2b141c7613afaa6375",
    //     "candidate": {
    //         "sdpMid": "data",
    //             "sdp": "candidate:3542374810 1 udp 2122131711 2401:4900:83bb:5a5a:c4f8:fb93:f34c:acdb 64955 typ host generation 0 ufrag UXEN network-id 14 network-cost 900",
    //                 "sdpMLineIndex": 2
    //     }, "type": "candidate"
    // }
    const filter1 = { _id: data.id };
    const update1 = { $set: { "message.$[elem].readStatus": true } };
    const options1 = {
      arrayFilters: [{ "elem._id": data.audioCallId }],
      new: true,
    };
    // update a chat app entry for the picker
    let picker = await ChatApp.findOneAndUpdate(filter1, update1, options1);
    if (picker && picker.chatType == "single") {
      let chatWithChatOnline = connectedUser.get(picker.chatWith.toString());
      let chatWithOpenChat = viewSingleChatWith.get(picker.chatWith.toString());

      const filter2 = { sender: picker.chatWith, chatId: picker.chatId };
      const update2 = { $set: { "message.$[elem].readStatus": true } };
      const options2 = {
        arrayFilters: [{ "elem._id": data.audioCallId }],
        new: true,
      };
      // update a chat app entry for the sender
      let sender = await ChatApp.findOneAndUpdate(filter2, update2, options2);

      // Notify the caller that the call was picked up
      io.to(chatWithChatOnline).emit("pickupAudioCall", {
        msg: "ok",
        result: { candidate: data.candidate, type: data.type },
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// ========================
// Event handler for pickupVideoCall
const pickupVideoCall = async (io, socket, data) => {
  try {
    // data : {id: 662b4f7b72975e3f85cfb169 (_id), "videoCallId": "667d0f2b141c7613afaa6375",
    //     "candidate": {
    //         "sdpMid": "data",
    //             "sdp": "candidate:3542374810 1 udp 2122131711 2401:4900:83bb:5a5a:c4f8:fb93:f34c:acdb 64955 typ host generation 0 ufrag UXEN network-id 14 network-cost 900",
    //                 "sdpMLineIndex": 2
    //     }, "type": "candidate"
    // }
    const filter1 = { _id: data.id };
    const update1 = { $set: { "message.$[elem].readStatus": true } };
    const options1 = {
      arrayFilters: [{ "elem._id": data.videoCallId }],
      new: true,
    };
    // update a chat app entry for the picker
    let picker = await ChatApp.findOneAndUpdate(filter1, update1, options1);
    if (picker && picker.chatType == "single") {
      let chatWithChatOnline = connectedUser.get(picker.chatWith.toString());
      let chatWithOpenChat = viewSingleChatWith.get(picker.chatWith.toString());

      const filter2 = { sender: picker.chatWith, chatId: picker.chatId };
      const update2 = { $set: { "message.$[elem].readStatus": true } };
      const options2 = {
        arrayFilters: [{ "elem._id": data.videoCallId }],
        new: true,
      };
      // update a chat app entry for the sender
      let sender = await ChatApp.findOneAndUpdate(filter2, update2, options2);

      // Notify the caller that the call was picked up
      io.to(chatWithChatOnline).emit("pickupVideoCall", {
        msg: "ok",
        result: { candidate: data.candidate, type: data.type },
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// ========================
// function for emit all chat messages
const functionOfViewChatMessage = async (io, id) => {
  try {
    // Emit chat messages to the corresponding socket
    viewSingleChatWith.delete(id);
    let chatSocketId = connectedUser.get(id);
    if (chatSocketId) {
      let chat = await ChatApp.aggregate([
        {
          $match: { sender: mongoose.Types.ObjectId(id) },
        },
        {
          $lookup: {
            from: "chatcontacts",
            localField: "chatWith",
            foreignField: "_id",
            as: "userDetail",
          },
        },
        {
          $lookup: {
            from: "chatgroups",
            localField: "groupId",
            foreignField: "_id",
            as: "groupDetail",
          },
        },
        {
          $addFields: {
            allMessage: {
              $concatArrays: ["$message", "$unReadMessage"],
            },
            receiveunreadmessage: {
              $filter: {
                input: "$unReadMessage",
                as: "msg",
                cond: { $eq: ["$$msg.msgStatus", "receive"] },
              },
            },
          },
        },
        {
          $addFields: {
            unReadMessageCount: {
              $size: "$receiveunreadmessage",
            },
            lastMessageTime: {
              $cond: {
                if: { $gt: [{ $size: "$unReadMessage" }, 0] },
                then: {
                  $arrayElemAt: [
                    "$unReadMessage.date",
                    { $subtract: [{ $size: "$unReadMessage" }, 1] },
                  ],
                },
                else: "",
              },
            },
            lastMessage: {
              $cond: {
                if: { $gt: [{ $size: "$allMessage" }, 0] },
                then: {
                  $arrayElemAt: [
                    "$allMessage.msg",
                    { $subtract: [{ $size: "$allMessage" }, 1] },
                  ],
                },
                else: "",
              },
            },
            name: {
              $ifNull: [
                { $arrayElemAt: ["$userDetail.name", 0] },
                { $arrayElemAt: ["$groupDetail.name", 0] },
              ],
            },
            profile: {
              $ifNull: [
                { $arrayElemAt: ["$userDetail.profile", 0] },
                { $arrayElemAt: ["$groupDetail.profile", 0] },
              ],
            },
            isOnline: {
              $ifNull: [{ $arrayElemAt: ["$userDetail.isOnline", 0] }, false],
            },
          },
        },
        { $sort: { updatedAt: -1 } },
        {
          $project: {
            _id: 1,
            unReadMessageCount: 1,
            lastMessageTime: 1,
            name: 1,
            profile: 1,
            lastMessage: 1,
            chatType: 1,
            isOnline: 1,
          },
        },
      ]);
      io.to(chatSocketId).emit("viewChatMessage", { msg: "ok", result: chat });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// ========================
// Event handler for search user
const searchUser = async (io, socket, data) => {
  try {
    // data {key: "name, role"}
    // Emit user list
    viewSingleChatWith.delete(socket.chatData.id);
    let chatSocketId = connectedUser.get(socket.chatData.id);

    const { key } = data;

    let filter = { schoolId: socket.chatData.schoolId };
    if (key)
      filter.$or = [
        { name: { $regex: key, $options: "i" } },
        { role: { $regex: key, $options: "i" } },
      ];

    if (chatSocketId) {
      let chat = await ChatContact.aggregate([
        {
          $match: {
            schoolId: socket.chatData.schoolId,
            _id: { $ne: socket.chatData._id },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userDetail",
          },
        },
        {
          $addFields: {
            role: { $arrayElemAt: ["$userDetail.role", 0] },
            unReadMessageCount: 0,
            lastMessageTime: "",
            chatType: "single",
            lastMessage: "",
          },
        },
        {
          $match: filter,
        },
        {
          $project: {
            _id: 1,
            name: 1,
            profile: 1,
            unReadMessageCount: 1,
            lastMessageTime: 1,
            chatType: 1,
            lastMessage: 1,
          },
        },
      ]);
      io.to(chatSocketId).emit("searchUser", { msg: "ok", result: chat });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// ========================
// Event handler for emitGroupChat
const emitGroupChat = async (io, groupId, senderId) => {
  try {
    let groupUser = await ChatGroup.findById(groupId).lean();
    let participants = groupUser.participants;
    participants.push(...groupUser.admins);

    for (let i = 0; i < participants.length; i++) {
      let id = participants[i].id.toString();
      let findGroupUser = connectedUser.get(id);
      if (!findGroupUser) continue;
      else {
        let openChat = viewSingleChatWith.get(id);
        if (!openChat) await functionOfViewChatMessage(io, id);
        else if (openChat != groupId) continue;
        else if (openChat == groupId) {
          let chat = await ChatApp.findOne({
            sender: participants[i].id,
            groupId: groupId,
          })
            .populate("chatWith", "name isOnline lastSeen profile")
            .populate("message.id", "name profile")
            .populate("unReadMessage.id", "name profile")
            .populate("groupId", "name profile")
            .lean();

          if (chat && chat.unReadMessage.length > 0)
            chat.message.push(...chat.unReadMessage);

          // Emit chat messages to the corresponding socket

          chat.groupId.isOnline = false;
          chat.groupId.lastSeen = "";
          let sendChatData = {
            _id: chat._id,
            chatWith: chat.groupId,
            message: chat.message,
            chatType: chat.chatType,
            isTyping: chat.isTyping,
          };

          io.to(findGroupUser).emit("viewSingleChat", {
            msg: "ok",
            result: sendChatData,
          });
        }
      }
    }
  } catch (error) {
    console.log(error.message, "sdfsdf");
  }
};

//========================
// Event handler for delete message from everyone
const deleteFromEveryOne = async (io, socket, data) => {
  //data : {id: "6631d306d045a7532367bb5a" (_id), messageId: "660a75e7dd2eebfca0329a24"}
  try {
    viewSingleChatWith.delete(socket.chatData.id);
    const { id, messageId } = data;

    // Delete the message from the database
    let deleteSingleMsg = await ChatApp.updateOne(
      { _id: id },
      {
        $pull: {
          message: { _id: messageId },
          unReadMessage: { _id: messageId },
        },
      }
    );

    let chat = await ChatApp.findOne({ _id: id })
      .populate("chatWith", "name isOnline lastSeen profile")
      .populate("message.id", "name profile")
      .populate("unReadMessage.id", "name profile")
      .populate("groupId", "name profile")
      .lean();

    let chatWithSocket;
    if (chat.chatType == "single")
      chatWithSocket = chat.chatWith._id.toString();
    else if (chat.chatType == "group")
      chatWithSocket = chat.groupId._id.toString();
    viewSingleChatWith.set(socket.chatData.id, chatWithSocket);
    if (chat && chat.unReadMessage.length > 0)
      chat.message.push(...chat.unReadMessage);
    // Emit chat messages to the corresponding socket
    const chatSocketId = connectedUser.get(socket.chatData.id);

    let sendChatData;
    if (chat.chatType == "single") {
      sendChatData = {
        _id: chat._id,
        chatWith: chat.chatWith,
        message: chat.message,
        chatType: chat.chatType,
        isTyping: chat.isTyping,
      };
    } else {
      chat.groupId.isOnline = false;
      chat.groupId.lastSeen = "";
      sendChatData = {
        _id: chat._id,
        chatWith: chat.groupId,
        message: chat.message,
        chatType: chat.chatType,
        isTyping: chat.isTyping,
      };
    }
    io.to(chatSocketId).emit("viewSingleChat", {
      msg: "ok",
      result: sendChatData,
    });

    if (chat.chatType == "single") {
      // Delete the message from the database
      let deleteSingleMsg = await ChatApp.updateOne(
        { chatId: chat.chatId, sender: chat.chatWith._id },
        {
          $pull: {
            message: { _id: messageId },
            unReadMessage: { _id: messageId },
          },
        }
      );
    } else if (chat.chatType == "group") {
      let deleteMsgFromGroup = await ChatApp.updateMany(
        { groupId: chat.groupId._id },
        {
          $pull: {
            message: { _id: messageId },
            unReadMessage: { _id: messageId },
          },
        }
      );
    }
  } catch (error) {
    console.log(error.message);
  }
};

// ========================
// Event handler for typing status
const isTyping = async (io, socket, data) => {
  //data : {id: "6631d306d045a7532367bb5a" (_id), isTyping: false}
  try {
    let chat = await ChatApp.findOne({ _id: data.id });
    if (chat.chatType == "single") {
      const chatSocketId = connectedUser.get(chat.chatWith.toString());
      let chatWith = viewSingleChatWith.get(chat.chatWith.toString());
      if (chatSocketId && chatWith == socket.chatData.id) {
        let chatWithChat = await ChatApp.findOne({
          sender: chat.chatWith,
          chatId: chat.chatId,
        })
          .populate("chatWith", "name isOnline lastSeen profile")
          .populate("message.id", "name profile")
          .populate("unReadMessage.id", "name profile")
          .populate("groupId", "name profile")
          .lean();

        if (chatWithChat && chatWithChat.unReadMessage.length > 0)
          chatWithChat.message.push(...chatWithChat.unReadMessage);
        let sendChatData = {
          _id: chatWithChat._id,
          chatWith: chatWithChat.chatWith,
          message: chatWithChat.message,
          chatType: chatWithChat.chatType,
          isTyping: data.isTyping,
        };
        io.to(chatSocketId).emit("viewSingleChat", {
          msg: "ok",
          result: sendChatData,
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  connect,
  disconnect,
};

// const audioCallq = async (io, socket, data) => {
//     try {
//         const { id } = data;

//         // Assuming you have a function to get user details by ID
//         const user = await getUserById(id);

//         if (!user) {
//             socket.emit('audioCallError', { message: 'User not found' });
//             return;
//         }

//         // Notify the callee about the incoming call
//         io.to(user.socketId).emit('incomingAudioCall', {
//             from: socket.id,
//             callerId: socket.user.id // Assuming socket.user contains the caller's info
//         });

//         // Notify the caller that the call request was sent
//         socket.emit('audioCallRequested', { to: user.socketId });
//     } catch (error) {
//         console.error('Error handling audio call:', error);
//         socket.emit('audioCallError', { message: 'Internal server error' });
//     }
// };

// const pickupAudioCallw = async (io, socket, data) => {
//     try {
//         const { callerId } = data;

//         // Notify the caller that the call was picked up
//         io.to(callerId).emit('audioCallPickedUp', { by: socket.id });

//         // Notify the callee that the call was picked up successfully
//         socket.emit('audioCallConnected', { with: callerId });
//     } catch (error) {
//         console.error('Error picking up audio call:', error);
//         socket.emit('audioCallError', { message: 'Internal server error' });
//     }
// };
