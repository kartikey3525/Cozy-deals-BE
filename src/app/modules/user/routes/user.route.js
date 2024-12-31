let express = require("express");
let router = express.Router();
const { wrapAsync } = require("../../../helpers/router.helper");
const { upload } = require("../../../util/s3");
const { userAuthenticate } = require("../../../middleware/jwt.middleware");

const { sendOTP, verifyOTP } = require("../controllers/user.controller");

router.post("/sendOTP", wrapAsync(sendOTP));
router.post("/verifyOTP", wrapAsync(verifyOTP));

module.exports = router;
