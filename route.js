const User_routes = require("./src/app/modules/user/routes/user.route");

//All modules path and path-handler array
module.exports = [
  {
    path: "/api/user",
    handler: User_routes,
  },
];
