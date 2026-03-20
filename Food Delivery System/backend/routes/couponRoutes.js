const express = require("express");
const router = express.Router();
const Coupon = require("../models/Coupon");

// VALIDATE & APPLY COUPON
router.post("/apply", async (req, res) => {
  try {
    const { code, orderTotal } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }

    if (orderTotal < coupon.minOrder) {
      return res.status(400).json({
        message: `Minimum order ₹${coupon.minOrder} required`,
      });
    }

    let discountAmount = (orderTotal * coupon.discount) / 100;
    if (discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }

    // Increment usage
    coupon.usedCount += 1;
    await coupon.save();

    res.json({
      valid: true,
      discount: coupon.discount,
      discountAmount: Math.round(discountAmount),
      finalTotal: Math.round(orderTotal - discountAmount),
      message: `🎉 ${coupon.discount}% off applied! You save ₹${Math.round(discountAmount)}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET ALL ACTIVE COUPONS (for offers page)
router.get("/", async (req, res) => {
  try {
    const coupons = await Coupon.find({ isActive: true });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE COUPON (admin)
router.post("/create", async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
