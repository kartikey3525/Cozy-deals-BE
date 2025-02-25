const express = require("express");
const router = express.Router();
const { wrapAsync } = require("../../../../helpers/router.helper");
const {
  sellerAuthenticate,
  authenticate,
} = require("../../../../middleware/jwt.middleware");
const multer = require("multer");
const upload = multer({ dest: "public/" });
const {
  rating,
  updateRating,
  deleteRating,
  getRating,
  likeRating,
  commentOnRating,
  editComment,
  deleteComment,
  recentRating,
} = require("../controllers/rating.controller");

// these routes for sellers, buyers, admin
router.post("/rating", authenticate, wrapAsync(rating));
router.put("/updateRating", authenticate, wrapAsync(updateRating));
router.delete("/deleteRating", authenticate, wrapAsync(deleteRating));
router.get("/getRating", authenticate, wrapAsync(getRating));
router.post("/likeRating", authenticate, wrapAsync(likeRating));
router.post("/commentOnRating", authenticate, wrapAsync(commentOnRating));
router.put("/editComment", authenticate, wrapAsync(editComment));
router.delete("/deleteComment", authenticate, wrapAsync(deleteComment));
router.get("/recentRating", authenticate, wrapAsync(recentRating));
module.exports = router;
