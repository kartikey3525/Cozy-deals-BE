const User_routes = require("./src/app/modules/user/routes/user.route");
const Categories_routes = require("./src/app/modules/admin/categories/routes/categories.route");
const MyCategories_routes = require("./src/app/modules/seller/myCategories/routes/myCategories.route");
const requirementPost_routes = require("./src/app/modules/buyer/requirementPost/routes/requirementPost.route");
const Admin_User_routes = require("./src/app/modules/admin/user/routes/user.route");
const Post_routes = require("./src/app/modules/seller/post/routes/post.route");
const Buyer_Post_routes = require("./src/app/modules/buyer/post/routes/post.route");
const Rating_routes = require("./src/app/modules/seller/rating/routes/rating.route");

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
  {
    path: "/api/admin/user",
    handler: Admin_User_routes,
  },
  {
    path: "/api/post",
    handler: Post_routes,
  },
  {
    path: "/api/buyer/post",
    handler: Buyer_Post_routes,
  },
  {
    path: "/api/rate",
    handler: Rating_routes,
  },
];
