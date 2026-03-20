const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

// GET USER NOTIFICATIONS
router.get("/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE NOTIFICATION
router.post("/", async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// MARK AS READ
router.put("/:id/read", async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// MARK ALL AS READ
router.put("/read-all/:userId", async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.params.userId }, { isRead: true });
    res.json({ message: "All marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
