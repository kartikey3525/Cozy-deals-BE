const mongoose = require("mongoose");

const myCategoriesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    categories: [String],
  },
  { timestamps: true }
);

const MyCategories = mongoose.model("MyCategories", myCategoriesSchema);
module.exports = { MyCategories };
