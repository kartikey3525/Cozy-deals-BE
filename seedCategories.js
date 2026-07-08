require("dotenv").config();
require("./src/app/db/mongoose");

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const { Category } = require("./src/app/modules/admin/categories/models/categories.model");
async function seedCategories() {
  try {
    const jsonPath = path.join(__dirname, "categories.json");

    if (!fs.existsSync(jsonPath)) {
      throw new Error("categories.json not found");
    }

    const categories = JSON.parse(
      fs.readFileSync(jsonPath, "utf8")
    );

    console.log(`Found ${categories.length} categories`);

    console.log("Removing existing categories...");

    await Category.deleteMany({});

    console.log("Existing categories removed.");

    console.log("Importing...");

    for (const category of categories) {
      await Category.create(category);
    }

    console.log("==================================");
    console.log("Categories imported successfully.");
    console.log("==================================");

    process.exit(0);
  } catch (err) {
    console.error(err);

    process.exit(1);
  }
}

mongoose.connection.once("open", () => {
  seedCategories();
});