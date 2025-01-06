const mongoose = require("mongoose");
const { isValid } = require("./src/app/middleware/validator.middleware");

const msgSchema = new mongoose.Schema({
  sender: {
    type: String,
    trim: true,
    required: true,
  },
  data: [],
});

let msg = mongoose.model("msgfaltu", msgSchema);
module.exports = { msg };

const express = require("express");
const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { sender, data } = req.body;
    if (!isValid(sender))
      res.status(404).send({
        msg: "sender is required",
        statusCode: 0,
      });
    const create = await msg.findOneAndUpdate(
      {
        sender: sender,
      },
      {
        $push: {
          data: data,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );
    res.status(200).json({
      msg: "success",
      statusCode: 1,
    });
  } catch (error) {
    res.status(500).json({
      msg: "error",
      statusCode: 0,
    });
  }
});

module.exports = router;

