const mongoose = require("mongoose");

const deliveryBoySchema = new mongoose.Schema({
  name: String,
  phone: String,
  isFree: {
    type: Boolean,
    default: true
  },
  location: {
    lat: Number,
    lng: Number
  }
});

module.exports = mongoose.model("DeliveryBoy", deliveryBoySchema);
