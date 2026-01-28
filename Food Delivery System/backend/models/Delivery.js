const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },

  deliveryBoy: {
    name: {
      type: String,
      default: "Delivery Boy 1"
    },
    status: {
      type: String,
      enum: ["FREE", "BUSY"],
      default: "BUSY"
    }
  },

  currentLocation: {
    latitude: Number,
    longitude: Number
  },

  status: {
    type: String,
    enum: ["PICKED", "ON_THE_WAY", "DELIVERED"],
    default: "PICKED"
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Delivery", deliverySchema);
