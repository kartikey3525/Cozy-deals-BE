const express = require("express");
const router = express();
const { wrapAsync } = require("../../../../helpers/router.helper");
const { adminAuthenticate } = require("../../../../middleware/jwt.middleware");
const { allUsers, getUserById } = require("../controllers/user.controller");

router.get("/allUsers", adminAuthenticate, wrapAsync(allUsers));
router.get("/getUserById", adminAuthenticate, wrapAsync(getUserById));

module.exports = router;
