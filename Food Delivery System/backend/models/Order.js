const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    // CUSTOMER DETAILS
    customerName: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },

    // LOCATION (MAP)
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    },

    // CART ITEMS
    items: {
      type: Array,
      required: true
    },

    // BILL
    total: {
      type: Number,
      required: true
    },

    // ORDER STATUS
    status: {
      type: String,
      default: "Placed"
      // Placed → Accepted → Out for Delivery → Delivered
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Order", OrderSchema);
