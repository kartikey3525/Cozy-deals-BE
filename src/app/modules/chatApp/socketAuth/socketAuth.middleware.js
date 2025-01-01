const jwt = require("jsonwebtoken");
const socketAuth = (io) => {
  try {
    io.use((socket, next) => {
      const token = socket.handshake.headers.token;
      if (!token) return next(new Error("Authentication error"));

      jwt.verify(token, process.env.secret_token, (err, user) => {
        if (err) return next(new Error("Authentication error"));
        user.username = "name"
        socket.user = user;
        next();
      });
    });
  } catch (error) {
    return next(new Error("Authentication error"));
  }
};

module.exports = { socketAuth };
