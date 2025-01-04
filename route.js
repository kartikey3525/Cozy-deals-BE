const User_routes = require("./src/app/modules/user/routes/user.route");
const Categories_routes = require("./src/app/modules/admin/categories/routes/categories.route");
const MyCategories_routes = require("./src/app/modules/seller/myCategories/routes/myCategories.route");
const requirementPost_routes = require("./src/app/modules/buyer/requirementPost/routes/requirementPost.route");

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
  {
    path: "/api/seller/category",
    handler: MyCategories_routes,
  },
  {
    path: "/api/requirementPost",
    handler: requirementPost_routes,
  },
];
