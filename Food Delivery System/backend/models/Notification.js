const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["order", "delivery", "offer", "system"],
      default: "system",
    },
    isRead: { type: Boolean, default: false },
    icon: { type: String, default: "🔔" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
