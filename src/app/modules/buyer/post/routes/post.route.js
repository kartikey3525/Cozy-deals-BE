let express = require("express");
let router = express.Router();
const { wrapAsync } = require("../../../../helpers/router.helper");
const { buyerAuthenticate } = require("../../../../middleware/jwt.middleware");
const multer = require("multer");
const upload = multer({ dest: "public/" });

const { recentPosts, allPosts } = require("../controllers/post.controller");

router.get("/recentPosts", buyerAuthenticate, wrapAsync(recentPosts));
router.post("/allPosts", buyerAuthenticate, wrapAsync(allPosts));

module.exports = router;
