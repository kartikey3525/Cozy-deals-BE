const { AuthSocket } = require("../../../middleware/authSocket.middleware");
const mongoose = require("mongoose");

// Define the function to handle chat socket connections
function socketchatfunction(io) {
  try {
    // Middleware to authenticate socket connections
    io.use(async (socket, next) => {
      try {
        await AuthSocket(socket, next); // Execute authentication middleware
      } catch (err) {
        console.error("Socket middleware error:", err.message);
      }
    });

    // Event handler for new socket connections
    io.on("connection", async (socket) => {
      try {
        console.log("A user connected", socket.id, "socket.id");

        // Event handler for disconnecting sockets
        socket.on("disconnect", async () => {
          await disconnect(io, socket);
        });
      } catch (error) {
        console.error("Error in socket connection:", error.message);
      }
    });
  } catch (error) {
    console.error("Error in connecting to MongoDB:", error.message);
  }
}

module.exports = { socketchatfunction };
