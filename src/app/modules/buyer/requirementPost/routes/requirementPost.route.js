let express = require("express");
let router = express.Router();
const { wrapAsync } = require("../../../../helpers/router.helper");
const {
  buyerAuthenticate,
  authenticate,
} = require("../../../../middleware/jwt.middleware");
const multer = require("multer");
const upload = multer({ dest: "public/" });

const {
  getCategory,
} = require("../../../admin/categories/controllers/categories.controller");

const {
  postRequirement,
  getRequirement,
  updateRequirement,
  deleteRequirement,
} = require("../controllers/requirementPost.controller");

//Category
router.get("/getCategory", authenticate, wrapAsync(getCategory));

//requirements post
router.post("/postRequirement", buyerAuthenticate, wrapAsync(postRequirement));
router.get("/getRequirement", buyerAuthenticate, wrapAsync(getRequirement));
router.put(
  "/updateRequirement",
  buyerAuthenticate,
  wrapAsync(updateRequirement)
);
router.delete(
  "/deleteRequirement",
  buyerAuthenticate,
  wrapAsync(deleteRequirement)
);

module.exports = router;
