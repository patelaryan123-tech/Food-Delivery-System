const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const User = require("../models/User");
const Notification = require("../models/Notification");

// CREATE ORDER
router.post("/create", async (req, res) => {
  try {
    const { userId, items, total, discount, finalTotal, paymentMethod, ecoToggle, isScheduled, scheduledTime } = req.body;

    // 1. Check Wallet Balance if selected
    if (paymentMethod === "Wallet" && userId) {
      const user = await User.findById(userId);
      if (user.walletBalance < finalTotal) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
      }
      user.walletBalance -= finalTotal;
      user.totalSavings += (discount || 0);
      
      // Bonus: Streak logic
      const today = new Date().setHours(0,0,0,0);
      const last = user.streaks.lastOrderDate ? new Date(user.streaks.lastOrderDate).setHours(0,0,0,0) : null;
      
      if (last === today - (24*60*60*1000)) {
        user.streaks.count += 1;
      } else if (last !== today) {
        user.streaks.count = 1;
      }
      user.streaks.lastOrderDate = new Date();

      await user.save();
    }

    const order = await Order.create({
      userId,
      items,
      total,
      discount,
      couponCode: req.body.couponCode || "",
      finalTotal,
      customerName: req.body.customerName,
      phone: req.body.phone,
      address: req.body.address,
      lat: req.body.lat,
      lng: req.body.lng,
      paymentMethod,
      ecoToggle: ecoToggle || false,
      isScheduled: isScheduled || false,
      scheduledTime: isScheduled ? new Date(scheduledTime) : null,
      status: "Placed",
      paymentStatus: paymentMethod === "Wallet" ? "Paid" : "Pending",
      statusHistory: [{ status: "Placed", timestamp: new Date() }],
    });

    // Create notification
    if (userId) {
      await Notification.create({
        userId,
        title: "Order Placed! 🎉",
        message: `Order #${order._id.toString().slice(-6)} placed with ${paymentMethod}.`,
        type: "order",
        icon: "🛒",
      });
    }

    res.json({ message: "✅ Order placed successfully", orderId: order._id, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ALL ORDERS
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET USER ORDERS (order history)
router.get("/user/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET SINGLE ORDER
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(404).json({ message: "Order not found" });
  }
});

// UPDATE ORDER STATUS
router.put("/:id/status", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = req.body.status;
    order.statusHistory.push({
      status: req.body.status,
      timestamp: new Date(),
    });

    if (req.body.deliveryBoyName) {
      order.deliveryBoyName = req.body.deliveryBoyName;
    }

    await order.save();

    // LOYALTY POINTS LOGIC
    if (req.body.status === "Delivered" && order.userId) {
      try {
        const user = await User.findById(order.userId);
        if (user) {
          const pointsEarned = Math.floor((order.finalTotal || order.total) / 100);
          const ecoBonus = order.ecoToggle ? 5 : 0;
          user.loyaltyPoints += (pointsEarned + ecoBonus);

          // Tier Upgrade Logic
          if (user.loyaltyPoints >= 1000) user.membershipTier = "Platinum";
          else if (user.loyaltyPoints >= 500) user.membershipTier = "Gold";
          else if (user.loyaltyPoints >= 200) user.membershipTier = "Silver";
          else user.membershipTier = "Bronze";

          await user.save();

          // Create notification for loyalty points
          await Notification.create({
            userId: order.userId,
            title: "Loyalty Points Earned! 🎖️",
            message: `You earned ${pointsEarned} points ${ecoBonus ? '(+5 Eco Bonus! 🌿)' : ''}! Total: ${user.loyaltyPoints}. Tier: ${user.membershipTier}`,
            type: "order",
            icon: "🎖️",
          });
        }
      } catch (err) {
        console.error("Loyalty update failed:", err);
      }
    }

    // Create notification for status update
    if (order.userId) {
      const statusMessages = {
        Confirmed: "Your order has been confirmed by the restaurant! 👨‍🍳",
        Preparing: "Your food is being prepared! 🍳",
        "Out for Delivery": "Your order is out for delivery! 🚴",
        Delivered: "Your order has been delivered! Enjoy your meal! 🎉",
        Cancelled: "Your order has been cancelled. 😢",
      };

      await Notification.create({
        userId: order.userId,
        title: `Order ${req.body.status}`,
        message: statusMessages[req.body.status] || `Order status updated to ${req.body.status}`,
        type: "delivery",
        icon: req.body.status === "Delivered" ? "✅" : "🚴",
      });
    }

    res.json({ message: "Status updated", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE PAYMENT STATUS
router.put("/:id/payment", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        paymentStatus: req.body.paymentStatus,
        paymentId: req.body.paymentId || "",
        paymentMethod: req.body.paymentMethod || "UPI",
      },
      { new: true }
    );

    res.json({ message: "Payment updated", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADMIN ANALYTICS
router.get("/analytics/summary", async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const deliveredOrders = await Order.countDocuments({ status: "Delivered" });
    const pendingOrders = await Order.countDocuments({
      status: { $nin: ["Delivered", "Cancelled"] },
    });

    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      { $group: { _id: null, total: { $sum: "$finalTotal" } } },
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Most ordered items
    const allOrders = await Order.find({ status: "Delivered" });
    const itemCounts = {};
    allOrders.forEach((order) => {
      order.items.forEach((item) => {
        const name = item.name;
        itemCounts[name] = (itemCounts[name] || 0) + (item.qty || 1);
      });
    });

    const popularItems = Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Daily revenue (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$finalTotal" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalOrders,
      deliveredOrders,
      pendingOrders,
      totalRevenue,
      popularItems,
      dailyRevenue,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELIVERY PARTNER - Get assigned orders
router.get("/delivery/:deliveryBoyName", async (req, res) => {
  try {
    const orders = await Order.find({
      deliveryBoyName: req.params.deliveryBoyName,
      status: { $in: ["Confirmed", "Preparing", "Out for Delivery"] },
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET PENDING ORDERS FOR DELIVERY PARTNERS
router.get("/delivery-pending/all", async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ["Placed", "Confirmed", "Preparing"] },
      deliveryBoyName: { $in: ["", null] },
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
