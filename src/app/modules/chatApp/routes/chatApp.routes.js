const express = require("express");
const router = express.Router();
let { upload } = require("../../../util/s3");
const { authenticate } = require("../../../middleware/jwt.middleware");
const { wrapAsync } = require("../../../helpers/router.helper");

const {
  uploadVideo,
  uploadDocument,
} = require("../controllers/chatApp.controller");

//for upload image, audio, video
router.post(
  "/uploadVideo",
  authenticate,
  upload("chatApp/chatDocument").fields([
    { name: "chatDocument", maxCount: 1 },
  ]),
  wrapAsync(uploadVideo)
);
router.post(
  "/uploadDocument",
  authenticate,
  upload("chatApp/chatDocument").fields([
    { name: "chatDocument", maxCount: 1 },
  ]),
  wrapAsync(uploadDocument)
);
module.exports = router;
