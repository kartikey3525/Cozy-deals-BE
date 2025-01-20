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
} = require("../controllers/rating.controller");

// these routes for sellers, buyers, admin
router.post("/rating", authenticate, wrapAsync(rating));
router.put("/updateRating", authenticate, wrapAsync(updateRating));
router.delete("/deleteRating", authenticate, wrapAsync(deleteRating));
router.get("/getRating", authenticate, wrapAsync(getRating));
router.post("/likeRating", authenticate, wrapAsync(likeRating));

module.exports = router;
