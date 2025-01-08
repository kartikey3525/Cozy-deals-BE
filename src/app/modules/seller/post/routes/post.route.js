let express = require("express");
let router = express.Router();
const { wrapAsync } = require("../../../../helpers/router.helper");
const { sellerAuthenticate } = require("../../../../middleware/jwt.middleware");
const multer = require("multer");
const upload = multer({ dest: "public/" });

const {
  create,
  get,
  update,
  deletes,
} = require("../controllers/post.controller");

router.post("/create", sellerAuthenticate, wrapAsync(create));
router.get("/get", sellerAuthenticate, wrapAsync(get));
router.put("/update", sellerAuthenticate, wrapAsync(update));
router.delete("/deletes", sellerAuthenticate, wrapAsync(deletes));

module.exports = router;
