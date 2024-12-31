let express = require("express");
let router = express.Router();
const { wrapAsync } = require("../../../../helpers/router.helper");
const { adminAuthenticate } = require("../../../../middleware/jwt.middleware");

const {
  notifi,
  myNotifications,
  deleteNotifications,
} = require("../controllers/pushNotification.controller");

router.post("/notifi", wrapAsync(notifi));
router.get("/myNotifications", userAuthenticate, wrapAsync(myNotifications));
router.delete(
  "/deleteNotifications",
  userAuthenticate,
  wrapAsync(deleteNotifications)
);

module.exports = router;
