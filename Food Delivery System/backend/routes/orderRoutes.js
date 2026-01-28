const express = require("express");
const router = express.Router();
const Order = require("../models/Order");


router.post("/create", async (req, res) => {
  try {
    const order = await Order.create({
      items: req.body.items,
      total: req.body.total,
      customerName: req.body.customerName,
      phone: req.body.phone,
      address: req.body.address,
      lat: req.body.lat,
      lng: req.body.lng,
      status: "Placed"
    });

    res.json({
      message: "✅ Order placed successfully",
      orderId: order._id
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id/status", async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, {
      status: req.body.status
    });

    res.json({ message: "Status updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    res.json(order);
  } catch (err) {
    res.status(404).json({ message: "Order not found" });
  }
});

module.exports = router;
