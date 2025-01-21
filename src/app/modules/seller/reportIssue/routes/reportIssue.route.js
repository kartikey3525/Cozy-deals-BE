const express = require("express");
const router = express.Router();
const { wrapAsync } = require("../../../../helpers/router.helper");
const {
  sellerAuthenticate,
  authenticate,
  adminAuthenticate,
} = require("../../../../middleware/jwt.middleware");
const multer = require("multer");
const upload = multer({ dest: "public/" });
const {
  reportIssue,
  getReportIssue,
  reportIssueList,
  updateIssue,
} = require("../controllers/reportIssue.controller");

// these routes for sellers, buyers
router.post("/reportIssue", authenticate, wrapAsync(reportIssue));
router.get("/getReportIssue", authenticate, wrapAsync(getReportIssue));

// these routes for admin
router.get("/reportIssueList", adminAuthenticate, wrapAsync(reportIssueList));
router.put("/updateIssue", adminAuthenticate, wrapAsync(updateIssue));

module.exports = router;
