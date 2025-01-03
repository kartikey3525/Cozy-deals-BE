let express = require("express");
let router = express.Router();
const { wrapAsync } = require("../../../helpers/router.helper");
const { upload } = require("../../../util/s3");
const {
  adminAuthenticate,
  sellerAuthenticate,
  buyerAuthenticate,
  authenticate,
} = require("../../../middleware/jwt.middleware");

const {
  sendOTP,
  verifyOTP,
  login,
  google,
  updateProfile,
  getProfile,
  deleteProfile,
  deactivateProfile,
} = require("../controllers/user.controller");

router.post("/sendOTP", wrapAsync(sendOTP));
router.post("/verifyOTP", wrapAsync(verifyOTP));
router.post("/login", wrapAsync(login));
router.post("/google", wrapAsync(google));
router.put("/updateProfile", authenticate, wrapAsync(updateProfile));
router.get("/getProfile", authenticate, wrapAsync(getProfile));
router.delete("/deleteProfile", authenticate, wrapAsync(deleteProfile));
router.delete("/deactivateProfile", authenticate, wrapAsync(deactivateProfile));

module.exports = router;
