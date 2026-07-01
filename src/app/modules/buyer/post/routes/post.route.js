let express = require("express");
let router = express.Router();
const { wrapAsync } = require("../../../../helpers/router.helper");
const {
  buyerAuthenticate,
  authenticate,
} = require("../../../../middleware/jwt.middleware");
const multer = require("multer");
const upload = multer({ dest: "public/" });

const {
  recentPosts,
  allPosts,
  allShop,
  getPostById,
} = require("../controllers/post.controller");

// for seller, buyer, admin
router.get("/recentPosts", authenticate, wrapAsync(recentPosts));
router.post("/allPosts", authenticate, wrapAsync(allPosts));
router.post("/allShop", authenticate, wrapAsync(allShop));
router.get("/getPostById", authenticate, wrapAsync(getPostById));

module.exports = router;
