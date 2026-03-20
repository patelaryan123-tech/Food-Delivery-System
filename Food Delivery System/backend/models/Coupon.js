const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discount: { type: Number, required: true }, // percentage
  minOrder: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: 500 },
  isActive: { type: Boolean, default: true },
  usageLimit: { type: Number, default: 100 },
  usedCount: { type: Number, default: 0 },
  expiresAt: { type: Date },
  description: { type: String, default: "" },
});

module.exports = mongoose.model("Coupon", couponSchema);
