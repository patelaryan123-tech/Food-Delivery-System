const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Food = require("../models/Food");

// ADD REVIEW
router.post("/", async (req, res) => {
  try {
    const { userId, username, foodId, foodName, rating, comment } = req.body;

    const review = await Review.create({ userId, username, foodId, foodName, rating, comment });

    // Update food average rating
    const reviews = await Review.find({ foodId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Food.findOneAndUpdate(
      { _id: foodId },
      { avgRating: Math.round(avgRating * 10) / 10, totalReviews: reviews.length }
    ).catch(() => {
      // If food not found by _id, skip (demo items use string IDs)
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET REVIEWS BY FOOD
router.get("/food/:foodId", async (req, res) => {
  try {
    const reviews = await Review.find({ foodId: req.params.foodId }).sort({ createdAt: -1 });
    const avgRating =
      reviews.length > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
        : 0;

    res.json({ reviews, avgRating, totalReviews: reviews.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET ALL REVIEWS
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).limit(50);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
