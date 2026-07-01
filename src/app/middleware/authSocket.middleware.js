const jwt = require("jsonwebtoken");
const AuthSocket = (socket, next) => {
  try {
    const token = socket.handshake.headers.token;
    if (!token) return next(new Error("Authentication error"));

    jwt.verify(token, process.env.secret_token, (err, user) => {
      if (err) return next(new Error("Authentication error"));
      socket.user = user;
      next();
    });
  } catch (error) {
    return next(new Error("Authentication error"));
    // socket.emit("error", { msg: error.message });
  }
};

module.exports = { AuthSocket };
