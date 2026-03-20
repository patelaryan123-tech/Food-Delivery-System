const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: String,
  category: {
    type: String,
    enum: ["pizza", "burger", "chinese", "healthy", "desserts", "biryani", "momos", "fries", "paneer", "other"],
    default: "other",
  },
  description: { type: String, default: "" },
  inStock: { type: Boolean, default: true },
  stockQty: { type: Number, default: 100 },
  avgRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  restaurant: { type: String, default: "Eatify Kitchen" },
});

module.exports = mongoose.model("Food", foodSchema);
