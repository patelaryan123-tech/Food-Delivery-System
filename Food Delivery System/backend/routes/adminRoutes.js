const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const User = require("../models/User");
const Food = require("../models/Food");
const Coupon = require("../models/Coupon");

// DASHBOARD SUMMARY
router.get("/dashboard", async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: "customer" });
    const totalDeliveryPartners = await User.countDocuments({ role: "delivery" });
    const totalFoods = await Food.countDocuments();

    const revenueResult = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$finalTotal" } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const deliveredOrders = await Order.countDocuments({ status: "Delivered" });
    const pendingOrders = await Order.countDocuments({
      status: { $nin: ["Delivered", "Cancelled"] },
    });

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Recent orders
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10);

    // Daily revenue (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$finalTotal" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Popular items
    const allOrders = await Order.find();
    const itemCounts = {};
    allOrders.forEach((order) => {
      order.items.forEach((item) => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + (item.qty || 1);
      });
    });

    const popularItems = Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    res.json({
      totalOrders,
      totalUsers,
      totalDeliveryPartners,
      totalFoods,
      totalRevenue,
      deliveredOrders,
      pendingOrders,
      ordersByStatus,
      recentOrders,
      dailyRevenue,
      popularItems,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// SEED DEFAULT COUPONS
router.post("/seed-coupons", async (req, res) => {
  try {
    const existingCount = await Coupon.countDocuments();
    if (existingCount > 0) {
      return res.json({ message: "Coupons already exist" });
    }

    await Coupon.insertMany([
      {
        code: "WELCOME50",
        discount: 50,
        minOrder: 200,
        maxDiscount: 150,
        description: "50% off on first order (max ₹150)",
      },
      {
        code: "EATIFY20",
        discount: 20,
        minOrder: 300,
        maxDiscount: 100,
        description: "20% off on orders above ₹300",
      },
      {
        code: "FLAT100",
        discount: 100,
        minOrder: 500,
        maxDiscount: 100,
        description: "Flat ₹100 off on orders above ₹500",
      },
      {
        code: "FREESHIP",
        discount: 10,
        minOrder: 0,
        maxDiscount: 50,
        description: "10% off delivery charges",
      },
    ]);

    res.json({ message: "Default coupons created!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
