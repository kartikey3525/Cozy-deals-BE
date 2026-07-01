let express = require("express");
let router = express.Router();
const { wrapAsync } = require("../../../../helpers/router.helper");
const { authenticate } = require("../../../../middleware/jwt.middleware");

const {
  notifi,
  myNotifications,
  deleteNotifications,
} = require("../controllers/pushNotification.controller");

router.post("/notifi", wrapAsync(notifi));
router.get("/myNotifications", authenticate, wrapAsync(myNotifications));
router.delete(
  "/deleteNotifications",
  authenticate,
  wrapAsync(deleteNotifications)
);
module.exports = router;
