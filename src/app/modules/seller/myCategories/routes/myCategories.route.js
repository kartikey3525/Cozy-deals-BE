let express = require("express");
let router = express.Router();
const { wrapAsync } = require("../../../../helpers/router.helper");
const {
  authenticate,
  sellerAuthenticate,
} = require("../../../../middleware/jwt.middleware");
const multer = require("multer");
const upload = multer({ dest: "public/" });

const {
  getCategory,
} = require("../../../admin/categories/controllers/categories.controller");

const {
  addCategory,
  removeCategory,
  myCategory,
} = require("../controllers/myCategories.controller");

//Category
router.get("/getCategory", authenticate, wrapAsync(getCategory));

//MyCategory
router.post("/addCategory", sellerAuthenticate, wrapAsync(addCategory));
router.delete("/removeCategory", sellerAuthenticate, wrapAsync(removeCategory));
router.get("/myCategory", sellerAuthenticate, wrapAsync(myCategory));

module.exports = router;
