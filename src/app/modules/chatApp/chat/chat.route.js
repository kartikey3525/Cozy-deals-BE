const { socketAuth } = require("../socketAuth/socketAuth.middleware");
const mongoose = require("mongoose");

// Chat Schema
const ChatSchema = new mongoose.Schema({
  chatId: String, // Unique ID for one-on-one or group chat
  messages: [
    {
      sender: String,
      text: String,
      timestamp: { type: Date, default: Date.now },
      seenBy: [String], // Array of user IDs who have seen the message
    },
  ],
});

const Chat = mongoose.model("Chat", ChatSchema);

let socketConnections = (io) => {
  io.use(socketAuth(io));
  try {
    io.on("connection", (socket) => {
      console.log(`${socket.user.username} connected`);

      const generateChatId = (user1, user2) => {
        return [user1, user2].sort().join("_");
      };

      socket.on("chatId", async (data) => {
        let chatId = generateChatId(data.A, data.B);
        io.to(socket.id).emit("chatId", { chatId: chatId });
      });

      // Join a Chat Room
      socket.on("join", async ({ chatId }) => {
        socket.join(chatId);
        console.log(`${socket.user.username} joined chat ${chatId}`);
      });

      // Send a Message
      socket.on("send-message", async ({ chatId, message }) => {
        const chat =
          (await Chat.findOne({ chatId })) ||
          new Chat({ chatId, messages: [] });

        const newMessage = {
          sender: socket.user.username,
          text: message,
          timestamp: new Date(),
          seenBy: [socket.user.username],
        };

        chat.messages.push(newMessage);
        await chat.save();

        io.to(chatId).emit("receive-message", newMessage);
      });

      // Mark Message as Seen
      socket.on("mark-as-seen", async ({ chatId, messageId }) => {
        const chat = await Chat.findOne({ chatId });
        if (chat) {
          const message = chat.messages.id(messageId);
          if (message && !message.seenBy.includes(socket.user.username)) {
            message.seenBy.push(socket.user.username);
            await chat.save();
          }
        }
      });

      // Delete a Message (User-Specific)
      socket.on("delete-message", async ({ chatId, messageId }) => {
        const chat = await Chat.findOne({ chatId });
        if (chat) {
          const message = chat.messages.id(messageId);
          if (message && message.sender === socket.user.username) {
            message.remove(); // Only remove the message from the sender's view
            await chat.save();
          }
        }
      });

      socket.on("disconnect", () => {
        console.log(`${socket.user.username} disconnected`);
      });
    });
  } catch (error) {
    console.log("error in socket connection");
  }
};

module.exports = { socketConnections };
