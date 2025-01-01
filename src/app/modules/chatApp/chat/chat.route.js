const { socketAuth } = require("../socketAuth/socketAuth.middleware");

let socketConnections = (io) => {
  io.use(socketAuth(io));
  try {
    io.on("connection", (socket) => {
      try {
        console.log("made socket connection from chatApp", socket.id);
        socket.on("disconnect", () => {
          console.log("user disconnected from chatApp");
        });
      } catch (error) {
        console.log("error in socket connection", socket.id);
      }
    });
  } catch (error) {
    console.log("error in socket connection");
  }
};

module.exports = { socketConnections };
