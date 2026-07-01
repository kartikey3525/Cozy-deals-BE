const mongoose = require("mongoose");

const CategorieSchema = new mongoose.Schema(
  {
    id: { type: String, trim: true },
    index: { type: String, trim: true }, // index start from 1
    name: { type: String, trim: true },
    image: { type: String, trim: true },
    subCategories: [
      {
        id: { type: String, trim: true },
        index: { type: String, trim: true }, // index start from 1.1
        name: { type: String, trim: true },
        image: { type: String, trim: true },
        subCategories: [
          {
            id: { type: String, trim: true },
            index: { type: String, trim: true }, // index start from 1.1.1
            name: { type: String, trim: true },
            image: { type: String, trim: true },
            subCategories: [
              {
                id: { type: String, trim: true },
                index: { type: String, trim: true }, // index start from 1.1
                name: { type: String, trim: true },
                image: { type: String, trim: true },
                subCategories: [
                  {
                    id: { type: String, trim: true },
                    index: { type: String, trim: true }, // index start from 1.1.1
                    name: { type: String, trim: true },
                    image: { type: String, trim: true },
                    subCategories: [
                      {
                        id: { type: String, trim: true },
                        index: { type: String, trim: true }, // index start from 1.1
                        name: { type: String, trim: true },
                        image: { type: String, trim: true },
                        subCategories: [
                          {
                            id: { type: String, trim: true },
                            index: { type: String, trim: true }, // index start from 1.1.1
                            name: { type: String, trim: true },
                            image: { type: String, trim: true },
                            subCategories: [],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

CategorieSchema.pre("save", async function (next) {
  const categore = this;
  try {
    const lastCategorie = await mongoose
      .model("Categorie")
      .findOne()
      .sort({ createdAt: -1 });

    let newId = "CA0001";

    if (lastCategorie && lastCategorie.id) {
      const lastIdNum = parseInt(lastCategorie.id.replace("CA", ""));
      const nextIdNum = lastIdNum + 1;

      newId = `CA${nextIdNum.toString().padStart(4, "0")}`;
    }

    categore.id = newId;
    next();
  } catch (err) {
    next(err);
  }
});

const Category = mongoose.model("Categorie", CategorieSchema);
module.exports = { Category };
