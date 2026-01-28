const Order = require("../models/Order");
const DeliveryBoy = require("../models/DeliveryBoy");

exports.assignDeliveryBoy = async (req, res) => {
  const boy = await DeliveryBoy.findOne({ isFree: true });

  if (!boy) return res.status(400).json({ msg: "No delivery boy free" });

  boy.isFree = false;
  await boy.save();

  await Order.findByIdAndUpdate(req.body.orderId, {
    deliveryBoy: boy._id,
    status: "OUT_FOR_DELIVERY"
  });

  res.json({ boy });
};

exports.completeDelivery = async (req, res) => {
  const order = await Order.findById(req.body.orderId);
  order.status = "DELIVERED";
  await order.save();

  await DeliveryBoy.findByIdAndUpdate(order.deliveryBoy, {
    isFree: true
  });

  res.json({ msg: "Successfully Delivered" });
};
