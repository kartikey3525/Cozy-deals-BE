let express = require("express");
let router = express.Router();
const { wrapAsync } = require("../../../helpers/router.helper");
const { upload } = require("../../../util/storage");
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
  getAllProfile,
  deleteProfile,
  deactivateProfile,
  userProfile,
  uploadImage,
  // googleLogin
} = require("../controllers/user.controller");

router.post("/sendOTP", wrapAsync(sendOTP));
router.post("/verifyOTP", wrapAsync(verifyOTP));
router.post("/login", wrapAsync(login));
router.post("/googleLogin", wrapAsync(google));
router.put("/updateProfile", authenticate, wrapAsync(updateProfile));
router.get("/getProfile", authenticate, wrapAsync(getProfile));
router.get("/getAllProfile", wrapAsync(getAllProfile));
router.delete("/deleteProfile", authenticate, wrapAsync(deleteProfile));
router.delete("/deactivateProfile", authenticate, wrapAsync(deactivateProfile));
router.get("/userProfile", authenticate, wrapAsync(userProfile));
// router.post("/googleLogin" , wrapAsync(googleLogin))
router.post(
  "/uploadImage",
  upload("serviceApplication").fields([
    { name: "image", maxCount: 10 },
    // { name: "profile", maxCount: 1 },
  ]),
  wrapAsync(uploadImage)
);

module.exports = router;
