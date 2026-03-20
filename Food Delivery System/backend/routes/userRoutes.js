const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// REGISTER
router.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    let userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      username,
      email: email || "",
      password,
      role: role || "customer",
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// FORGOT PASSWORD (simple reset)
router.post("/forgot-password", async (req, res) => {
  const { username, email, newPassword } = req.body;
  try {
    const user = await User.findOne({ username, email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET USER PROFILE
router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE PREVIOUS ORDERS (for recommendations)
router.post("/update-history", async (req, res) => {
  const { userId, items } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    items.forEach((item) => {
      const existing = user.previousOrders.find((o) => o.foodId === item.foodId);
      if (existing) {
        existing.count += 1;
      } else {
        user.previousOrders.push({
          foodId: item.foodId || item.id,
          foodName: item.foodName || item.name,
          category: item.category || "other",
          count: 1,
        });
      }
    });

    await user.save();
    res.json({ message: "History updated" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// WALLET - ADD BALANCE
router.post("/wallet/add", async (req, res) => {
  const { userId, amount } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.walletBalance += parseFloat(amount);
    await user.save();
    res.json({ message: "Balance added", walletBalance: user.walletBalance });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ADDRESSES - ADD/UPDATE
router.post("/address/add", async (req, res) => {
  const { userId, label, address, lat, lng, isDefault } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (isDefault) {
      user.savedAddresses.forEach((a) => (a.isDefault = false));
    }

    user.savedAddresses.push({ label, address, lat, lng, isDefault });
    await user.save();
    res.json({ message: "Address saved", addresses: user.savedAddresses });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE ADDRESS
router.delete("/address/:userId/:addressId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.savedAddresses = user.savedAddresses.filter(
      (a) => a._id.toString() !== req.params.addressId
    );
    await user.save();
    res.json({ message: "Address deleted", addresses: user.savedAddresses });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// REFERRAL - GENERATE OR GET CODE
router.get("/referral/code/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.referralCode) {
      user.referralCode = `EAT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      await user.save();
    }
    res.json({ referralCode: user.referralCode });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// REFERRAL - APPLY CODE
router.post("/referral/apply", async (req, res) => {
  const { userId, code } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.referredBy) return res.status(400).json({ message: "Referral already applied" });

    const referrer = await User.findOne({ referralCode: code });
    if (!referrer) return res.status(404).json({ message: "Invalid referral code" });

    if (referrer._id.toString() === userId) return res.status(400).json({ message: "You cannot refer yourself" });

    // Apply referral
    user.referredBy = code;
    
    // Reward both (e.g., 50 credits each)
    referrer.walletBalance += 50;
    user.walletBalance += 50;

    await referrer.save();
    await user.save();

    res.json({ message: "Referral applied! ₹50 added to your wallet.", walletBalance: user.walletBalance });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// PLUS SUBSCRIPTION
router.post("/plus/subscribe", async (req, res) => {
  const { userId, plan } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Simulate payment success
    user.isPlusMember = true;
    const expiryDate = new Date();
    if (plan === 'monthly') {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }
    user.plusExpiry = expiryDate;

    await user.save();
    res.json({ message: "Welcome to Eatify Plus!", isPlusMember: true, plusExpiry: user.plusExpiry });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
