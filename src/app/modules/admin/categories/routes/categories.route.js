let express = require("express");
let router = express.Router();
const { wrapAsync } = require("../../../../helpers/router.helper");
const {
  adminAuthenticate,
  authenticate,
} = require("../../../../middleware/jwt.middleware");
const multer = require("multer");
const upload = multer({ dest: "public/" });

const {
  createCategory,
  updateCategory,
  getCategory,
  deleteCategory,
} = require("../controllers/categories.controller");

//Category
router.post("/createCategory", adminAuthenticate, wrapAsync(createCategory));
router.put("/updateCategory", adminAuthenticate, wrapAsync(updateCategory));
router.get("/getCategory", authenticate, wrapAsync(getCategory));
router.delete("/deleteCategory", adminAuthenticate, wrapAsync(deleteCategory));

module.exports = router;
