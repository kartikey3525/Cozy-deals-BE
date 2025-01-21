const express = require("express");
const cors = require("cors");
const http = require("http");
const bodyParser = require("body-parser");
const { env } = require("./src/environment/environment");
const routes = require("./route");
const mongoose = require("./src/app/db/mongoose");
const {
  socketchatfunction,
} = require("./src/app/modules/chatApp/business/socket.business");
const {
  socketchatSupportfn,
} = require("./src/app/modules/chatApp/business/socket.chatSupport");
const port = process.env.PORT || 3000;

const session = require("express-session");
const app = express();
app.use(express.json());
const server = http.createServer(app);
const path = require("path");
app.use(cors("*"));

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// Session Middleware (use express-session)
app.use(
  session({
    secret: "your-secret-key", // secret key for signing session ID cookies
    resave: false, // forces the session to be saved back to the store
    saveUninitialized: true, // forces a session that is uninitialized to be saved to the store
    cookie: { secure: false }, // set `secure: true` if you're using HTTPS
  })
);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  try {
    return res.status(200).send("server is running");
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

// socket function
const socket = require("socket.io");
let io = socket(server);
let chatIo = io.of("/chat");
let chatSupportIo = io.of("/chatSupport");

socketchatfunction(chatIo);
socketchatSupportfn(chatSupportIo);

// // Socket connection event
// io.on("connection", (socket) => {
//   console.log("made socket connection", socket.id);
//   socket.on("disconnect", () => {
//     console.log("user disconnected");
//   });
// });

app.use("/msg", require("./zfaltu")); // temporary route
//Mapping all modules path and path-handler
routes.map((route) => {
  app.use(route.path, route.handler);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`server is running on port ${port}`);
});

module.exports = { server };
