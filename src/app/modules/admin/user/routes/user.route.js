const express = require("express");
const router = express();
const { wrapAsync } = require("../../../../helpers/router.helper");
const { adminAuthenticate } = require("../../../../middleware/jwt.middleware");
const {
  allUsers,
  getUserById,
  deleteProfile,
  deactivateProfile,
} = require("../controllers/user.controller");

router.get("/allUsers", adminAuthenticate, wrapAsync(allUsers));
router.get("/getUserById", adminAuthenticate, wrapAsync(getUserById));
router.delete("/deleteProfile", adminAuthenticate, wrapAsync(deleteProfile));
router.delete(
  "/deactivateProfile",
  adminAuthenticate,
  wrapAsync(deactivateProfile)
);

module.exports = router;
