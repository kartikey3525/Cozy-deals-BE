const { AuthSocket } = require("../../../middleware/authSocket.middleware");
const {
  disconnect,
  openChat,
  sendMsg,
  chatSupportList,
} = require("./socketFunction.chatSupport");

// Define the function to handle chat socket connections
function socketchatSupportfn(io) {
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

        // Event handler for open chat (if admin open chat support of any user then send _id of document)
        socket.on("openChat", async (data) => {
          // {id: "678603c9676b7bd9de28d6d5"}
          try {
            await openChat(io, socket, data);
          } catch (error) {
            console.error("Socket disconnection error:", error.message);
            socket.emit("error", { msg: error.message });
          }
        });

        // Event handler for send msg
        socket.on("sendMsg", async (data) => {
          // data = {"id": "678603c9676b7bd9de28d6d5", "msg": "Hello, how are you?", "msgType": "text", "thumbnail": ""}
          try {
            await sendMsg(io, socket, data);
          } catch (error) {
            console.error("Socket disconnection error:", error.message);
            socket.emit("error", { msg: error.message });
          }
        });

        // Event handler for chat support list // this handler for admin only
        socket.on("chatSupportList", async (data) => {
          try {
            await chatSupportList(io, socket, data);
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

module.exports = { socketchatSupportfn };
