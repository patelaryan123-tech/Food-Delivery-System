const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    items: { type: Array, required: true },
    total: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: "" },
    finalTotal: { type: Number },
    status: {
      type: String,
      enum: ["Placed", "Confirmed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Placed",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    paymentMethod: { type: String, default: "UPI" },
    paymentId: { type: String, default: "" },
    deliveryBoyId: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryBoy" },
    deliveryBoyName: { type: String, default: "" },
    estimatedTime: { type: Number, default: 30 },
    ecoToggle: { type: Boolean, default: false },
    isScheduled: { type: Boolean, default: false },
    scheduledTime: { type: Date },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
