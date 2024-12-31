let express = require("express");
let router = express.Router();
const { wrapAsync } = require("../../../helpers/router.helper");
const { upload } = require("../../../util/s3");
const {
  adminAuthenticate,
  sellerAuthenticate,
  buyerAuthenticate,
} = require("../../../middleware/jwt.middleware");

const { sendOTP, verifyOTP, login } = require("../controllers/user.controller");

router.post("/sendOTP", wrapAsync(sendOTP));
router.post("/verifyOTP", wrapAsync(verifyOTP));
router.post("/login", wrapAsync(login));

module.exports = router;
