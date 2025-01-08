const { msg } = require("../../../../../config/message");
const { isValid } = require("../../../../middleware/validator.middleware");
const { Category } = require("../models/categories.model");
const mongoose = require("mongoose");

const createCategory = async (user, body) => {
  const { name, index, image } = body;
  if (!isValid(name)) throw "name is required";
  if (!isValid(index)) {
    const check = await Category.findOne({
      name: new RegExp(`^${name}$`, "i"),
    });
    if (check) throw "category already exists";
    let categoreCount = await Category.countDocuments();
    body.index = categoreCount + 1;
    const create = await Category.create(body);
  } else if (index.split(".").length === 1) {
    const check = await Category.findOne({ index: index });
    if (!check) throw "category not found";
    let len = 1;
    if (check.subCategories.length > 0) {
      let lastInd = check.subCategories[check.subCategories.length - 1].index;
      len = parseInt(lastInd.split(".")[1]) + 1;
    }
    const data = await Category.findOneAndUpdate(
      { index: index },
      {
        $push: {
          subCategories: {
            index: `${index}.${len}`,
            name: name,
            image: image,
            id: `SCA${index}000${len}`,
          },
        },
      },
      { new: true }
    );
  } else if (index.split(".").length > 1) {
    const addNestedExam = (categoryArray, indexArr, depth, name, image) => {
      const currentIndex = indexArr[depth];
      const found = categoryArray.find(
        (item) => item.index.split(".")[depth] === currentIndex
      );

      if (!found) throw "category not found";

      if (depth === indexArr.length - 1) {
        // Add new subcategory
        let len = 1;
        if (found.subCategories.length > 0) {
          let lastInd =
            found.subCategories[found.subCategories.length - 1].index;
          len = parseInt(lastInd.split(".")[depth + 1]) + 1;
        }

        found.subCategories.push({
          index: `${found.index}.${len}`,
          name: name,
          image: image,
          id: `SCA${found.index.replace(/\./g, "")}000${len}`,
        });
      } else {
        // Recursively go deeper
        addNestedExam(found.subCategories, indexArr, depth + 1, name);
      }
    };

    let indexArr = index.split(".");
    const check = await Category.findOne({ index: `${indexArr[0]}` });

    if (!check) throw "category not found";

    addNestedExam(check.subCategories, indexArr, 1, name, image);

    // Save updated category
    await check.save();
  }
  return {
    msg: "ok",
  };
};

const updateCategory = async (user, body) => {
  const { index, name, image } = body;
  if (!isValid(index)) throw "index is required";
  let data = {};
  if (isValid(name)) data.name = name;
  if (isValid(image)) data.image = image;

  if (index.split(".").length === 1) {
    let categories = await Category.findOneAndUpdate(
      { index: index },
      { $set: data },
      { new: true }
    );
    if (!categories) throw "category not found";
  } else if (index.split(".").length > 1) {
    const addNestedExam = (categoryArray, indexArr, depth) => {
      const currentIndex = indexArr[depth];
      const found = categoryArray.find(
        (item) => item.index.split(".")[depth] === currentIndex
      );

      if (!found) throw "category not found";

      if (depth === indexArr.length - 1) {
        if (isValid(name)) found.name = name;
        if (isValid(image)) found.image = image;
      } else {
        // Recursively go deeper
        addNestedExam(found.subCategories, indexArr, depth + 1);
      }
    };
    let indexArr = index.split(".");
    const check = await Category.findOne({ index: `${indexArr[0]}` });
    if (!check) throw "category not found";

    addNestedExam(check.subCategories, indexArr, 1);
    await check.save();
  }
  return {
    msg: "ok",
  };
};

const getCategory = async (user, query) => {
  const { index, key } = query;
  let result = [];
  if (!isValid(index)) {
    let filter = {};
    if (isValid(key)) filter.name = new RegExp(query.key, "i");
    const categories = await Category.find(filter);
    result = categories.map((category) => {
      const categoryObject = {
        ...category.toObject(),
        hasSubcategories:
          category.subCategories && category.subCategories.length > 0,
      };
      delete categoryObject.subCategories; // Remove the 'exam' property
      return categoryObject;
    });
  } else if (index.split(".").length === 1) {
    let categories = await Category.findOne({ index: index });
    if (!categories) throw "category not found";
    categories = categories.subCategories;
    result = categories.map((category) => {
      const categoryObject = {
        ...category.toObject(),
        hasSubcategories:
          category.subCategories && category.subCategories.length > 0,
      };
      delete categoryObject.subCategories; // Remove the 'subCategories' property
      return categoryObject;
    });
  } else if (index.split(".").length > 1) {
    const addNestedExam = (categoryArray, indexArr, depth) => {
      const currentIndex = indexArr[depth];
      const found = categoryArray.find(
        (item) => item.index.split(".")[depth] === currentIndex
      );

      if (!found) throw "category not found";

      if (depth === indexArr.length - 1) {
        let categories = found.subCategories;
        result = categories.map((category) => {
          const categoryObject = {
            ...category.toObject(),
            hasSubcategories:
              category.subCategories && category.subCategories.length > 0,
          };
          delete categoryObject.subCategories; // Remove the 'subCategories' property
          return categoryObject;
        });
      } else {
        // Recursively go deeper
        addNestedExam(found.subCategories, indexArr, depth + 1);
      }
    };
    let indexArr = index.split(".");
    const check = await Category.findOne({ index: `${indexArr[0]}` });
    if (!check) throw "category not found";

    addNestedExam(check.subCategories, indexArr, 1);
  }
  return {
    msg: "ok",
    count: result.length,
    data: result,
  };
};

const deleteCategory = async (user, query) => {
  const { index } = query;
  if (!isValid(index)) throw "index is required";

  if (index.split(".").length === 1) {
    let categories = await Category.findOne({ index: index });
    if (!categories) throw "category not found";
    if (categories.subCategories.length > 0)
      throw "Unable to delete: Remove subcategories first.";
    await Category.deleteOne({ index: index });
  } else if (index.split(".").length > 1) {
    const addNestedExam = (categoryArray, indexArr, depth) => {
      const currentIndex = indexArr[depth];
      const found = categoryArray.find(
        (item) => item.index.split(".")[depth] === currentIndex
      );

      if (!found) throw "category not found";

      if (depth === indexArr.length - 1) {
        if (found.subCategories.length > 0)
          throw "Unable to delete: Remove subcategories first.";
        for (let i = 0; i < categoryArray.length; i++) {
          if (categoryArray[i].index === found.index) {
            categoryArray.splice(i, 1);
            break;
          }
        }
      } else {
        // Recursively go deeper
        addNestedExam(found.subCategories, indexArr, depth + 1);
      }
    };
    let indexArr = index.split(".");
    const check = await Category.findOne({ index: `${indexArr[0]}` });
    if (!check) throw "category not found";

    addNestedExam(check.subCategories, indexArr, 1);
    await check.save();
  }
  return {
    msg: "ok",
  };
};

module.exports = {
  createCategory,
  updateCategory,
  getCategory,
  deleteCategory,
};
