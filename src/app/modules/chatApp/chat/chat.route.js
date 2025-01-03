const { socketAuth } = require("../socketAuth/socketAuth.middleware");
const mongoose = require("mongoose");
const { ChatId, Chat } = require("./chat.model");

let socketConnections = (io) => {
  io.use(socketAuth(io));
  try {
    io.on("connection", (socket) => {
      try {
        console.log(`${socket.user.username} connected`);

        const generateChatId = (user1, user2) => {
          return [user1, user2].sort().join("_");
        };

        socket.on("chatId", async (data) => {
          try {
            // let chatId = generateChatId(data.A, data.B);
            if (!data.id) {
              callback({ error: "User ID is required" });
            }
            let chatId = await ChatId.findOneAndUpdate(
              {
                $or: [
                  { userA: socket.user._id, userB: data.id },
                  { userA: data.id, userB: socket.user._id },
                ],
              },
              {},
              { upsert: true, new: true }
            );
            io.to(socket.id).emit("chatId", { chatId: chatId._id });
          } catch (error) {}
        });

        // Join a Chat Room
        socket.on("join", async ({ chatId }) => {
          try {
            socket.join(chatId);
            console.log(`${socket.user.username} joined chat ${chatId}`);
          } catch (error) {}
        });

        // Send a Message
        socket.on("send-message", async ({ chatId, message }) => {
          try {
            const chat =
              (await Chat.findOne({ _id: id })) ||
              new Chat({ _id: id, messages: [] });

            const newMessage = {
              sender: socket.user.username,
              text: message,
              timestamp: new Date(),
              seenBy: [socket.user.username],
            };

            chat.messages.push(newMessage);
            await chat.save();

            io.to(chatId).emit("receive-message", newMessage);
          } catch (error) {}
        });

        // Mark Message as Seen
        socket.on("mark-as-seen", async ({ chatId, messageId }) => {
          try {
            const chat = await Chat.findOne({ chatId });
            if (chat) {
              const message = chat.messages.id(messageId);
              if (message && !message.seenBy.includes(socket.user.username)) {
                message.seenBy.push(socket.user.username);
                await chat.save();
              }
            }
          } catch (error) {}
        });

        // Delete a Message (User-Specific)
        socket.on("delete-message", async ({ chatId, messageId }) => {
          try {
            const chat = await Chat.findOne({ chatId });
            if (chat) {
              const message = chat.messages.id(messageId);
              if (message && message.sender === socket.user.username) {
                message.remove(); // Only remove the message from the sender's view
                await chat.save();
              }
            }
          } catch (error) {}
        });

        socket.on("disconnect", () => {
          try {
            console.log(`${socket.user.username} disconnected`);
          } catch (error) {}
        });
      } catch (error) {}
    });
  } catch (error) {
    console.log("error in socket connection");
  }
};

module.exports = { socketConnections };
