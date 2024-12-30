const express = require("express");
const cors = require("cors");
const http = require("http");
const bodyParser = require("body-parser");
const { env } = require("./src/environment/environment");
const routes = require("./route");
const mongoose = require("./src/app/db/mongoose");
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

// Serialize the user into the session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize the user from the session
passport.deserializeUser((user, done) => {
  done(null, user);
});

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

//Mapping all modules path and path-handler
routes.map((route) => {
  app.use(route.path, route.handler);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`server is running on port ${port}`);
});

module.exports = { server };
