const express = require("express");
const router = express.Router();
const { wrapAsync } = require("../../../../helpers/router.helper");
const { sellerAuthenticate } = require("../../../../middleware/jwt.middleware");
const multer = require("multer");
const upload = multer({ dest: "public/" });
const { rating } = require("../controllers/rating.controller");

router.post("/rating", sellerAuthenticate, wrapAsync(rating));

module.exports = router;
