const Order = require("../models/Order");

exports.placeOrder = async (req, res) => {
  const order = await Order.create(req.body);
  res.json({ message: "Order placed", order });
};
