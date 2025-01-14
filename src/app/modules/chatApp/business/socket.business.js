const { AuthSocket } = require("../../../middleware/authSocket.middleware");
const {
  connect,
  disconnect,
  userList,
  openChat,
  createChat,
  sendMsg,
} = require("./socketFunction.business");

// Define the function to handle chat socket connections
function socketchatfunction(io) {
  try {
    // Middleware to authenticate socket connections
    io.use(async (socket, next) => {
      try {
        await AuthSocket(socket, next); // Execute authentication middleware
      } catch (error) {
        console.error("Socket middleware error:", err.message);
        socket.emit("error", { msg: error.message });
      }
    });

    // Event handler for new socket connections
    io.on("connection", async (socket) => {
      try {
        console.log("A user connected", socket.id, "socket.id", socket.user);

        // handler for connecting sockets
        await connect(io, socket);

        // Event handler for user list
        socket.on("userList", async (data) => {
          // data = {key: "search key"} optional
          try {
            await userList(io, socket, data);
          } catch (error) {
            console.error("Socket disconnection error:", error.message);
            socket.emit("error", { msg: error.message });
          }
        });

        // Event handler for create chat
        socket.on("createChat", async (data) => {
          // data = {userId: "6777999e3153e4016c5eca88"}
          try {
            await createChat(io, socket, data);
          } catch (error) {
            console.error("Socket disconnection error:", error.message);
            socket.emit("error", { msg: error.message });
          }
        });

        // Event handler for open chat
        socket.on("openChat", async (data) => {
          // data = {id: "6777999e3153e4016c5eca88"}
          try {
            await openChat(io, socket, data);
          } catch (error) {
            console.error("Socket disconnection error:", error.message);
            socket.emit("error", { msg: error.message });
          }
        });

        // Event handler for open chat
        socket.on("sendMsg", async (data) => {
          // data = {"chatId": "678603c9676b7bd9de28d6d5", "msg": "Hello, how are you?", "msgType": "text", "thumbnail": ""}
          try {
            await sendMsg(io, socket, data);
          } catch (error) {
            console.error("Socket disconnection error:", error.message);
            socket.emit("error", { msg: error.message });
          }
        });

        // Event handler for disconnecting sockets
        socket.on("disconnect", async () => {
          try {
            await disconnect(io, socket);
          } catch (error) {
            console.error("Socket disconnection error:", error.message);
            socket.emit("error", { msg: error.message });
          }
        });
      } catch (error) {
        console.error("Error in socket connection:", error.message);
        socket.emit("error", { msg: error.message });
      }
    });
  } catch (error) {
    console.error("Error in connecting to MongoDB:", error.message);
  }
}

module.exports = { socketchatfunction };
