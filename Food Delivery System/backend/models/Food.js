const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  stock: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model("Food", foodSchema);
