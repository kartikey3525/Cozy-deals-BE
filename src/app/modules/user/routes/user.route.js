let express = require("express");
let router = express.Router();
const { wrapAsync } = require("../../../helpers/router.helper");
const { upload } = require("../../../util/s3");
const { userAuthenticate } = require("../../../middleware/jwt.middleware");


// router.get("/userProfile", authuthenticate, wrapAsync(userProfile));
module.exports = router;
