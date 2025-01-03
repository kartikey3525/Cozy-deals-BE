const User_routes = require("./src/app/modules/user/routes/user.route");
const Categories_routes = require("./src/app/modules/admin/categories/routes/categories.route");

//All modules path and path-handler array
module.exports = [
  {
    path: "/api/user",
    handler: User_routes,
  },
  {
    path: "/api/category",
    handler: Categories_routes,
  },
];
