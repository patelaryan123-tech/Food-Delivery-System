const express = require("express");
const router = express.Router();
const Food = require("../models/Food");
const Order = require("../models/Order");

// GET ALL FOODS
router.get("/", async (req, res) => {
  try {
    const foods = await Food.find();
    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD FOOD (vendor/admin)
router.post("/", async (req, res) => {
  try {
    const food = new Food(req.body);
    await food.save();
    res.status(201).json(food);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE FOOD
router.put("/:id", async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(food);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE STOCK
router.put("/:id/stock", async (req, res) => {
  try {
    const { stockQty, inStock } = req.body;
    const food = await Food.findByIdAndUpdate(
      req.params.id,
      {
        stockQty: stockQty !== undefined ? stockQty : undefined,
        inStock: inStock !== undefined ? inStock : stockQty > 0,
      },
      { new: true }
    );
    res.json(food);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE FOOD
router.delete("/:id", async (req, res) => {
  try {
    await Food.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// SEED DEFAULT FOODS
router.post("/seed", async (req, res) => {
  try {
    const existingCount = await Food.countDocuments();
    if (existingCount > 0) {
      return res.json({ message: "Foods already exist", count: existingCount });
    }

    const foods = [
      { name: "Margherita Pizza", price: 199, image: "/images/pizza1.jpg", category: "pizza", inStock: true, stockQty: 50 },
      { name: "Cheese Burst Pizza", price: 299, image: "/images/pizza2.jpg", category: "pizza", inStock: true, stockQty: 30 },
      { name: "Paneer Tikka Pizza", price: 329, image: "/images/pizza3.jpg", category: "pizza", inStock: true, stockQty: 25 },
      { name: "Farmhouse Pizza", price: 349, image: "/images/pizza4.jpg", category: "pizza", inStock: true, stockQty: 20 },
      { name: "Veg Burger", price: 129, image: "/images/burger1.jpg", category: "burger", inStock: true, stockQty: 60 },
      { name: "Cheese Burger", price: 159, image: "/images/burger2.jpg", category: "burger", inStock: false, stockQty: 0 },
      { name: "Paneer Burger", price: 179, image: "/images/burger3.jpg", category: "burger", inStock: true, stockQty: 40 },
      { name: "French Fries", price: 99, image: "/images/fries1.jpg", category: "fries", inStock: true, stockQty: 100 },
      { name: "Peri Peri Fries", price: 129, image: "/images/fries2.jpg", category: "fries", inStock: true, stockQty: 80 },
      { name: "Veg Momos", price: 119, image: "/images/momos1.jpg", category: "momos", inStock: true, stockQty: 70 },
      { name: "Fried Momos", price: 149, image: "/images/momos2.jpg", category: "momos", inStock: true, stockQty: 55 },
      { name: "Veg Biryani", price: 199, image: "/images/biryani1.jpg", category: "biryani", inStock: true, stockQty: 45 },
      { name: "Paneer Biryani", price: 229, image: "/images/biryani2.jpg", category: "biryani", inStock: true, stockQty: 35 },
      { name: "Butter Paneer", price: 249, image: "/images/paneer1.jpg", category: "paneer", inStock: true, stockQty: 30 },
      { name: "Shahi Paneer", price: 259, image: "/images/paneer2.jpg", category: "paneer", inStock: false, stockQty: 0 },
    ];

    await Food.insertMany(foods);
    res.json({ message: "Default foods seeded!", count: foods.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET TRENDING FOODS
router.get("/trending", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(100);
    const itemMap = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            itemMap[item.name] = (itemMap[item.name] || 0) + (item.qty || 1);
        });
    });
    const sorted = Object.entries(itemMap).sort((a,b) => b[1] - a[1]).slice(0, 8);
    const trendingNames = sorted.map(s => s[0]);
    const trending = await Food.find({ name: { $in: trendingNames } });
    
    // Sort trending back to match order of popularity
    const result = trendingNames.map(name => trending.find(f => f.name === name)).filter(Boolean);
    
    res.json(result);
  } catch(err) {
      res.status(500).json({ message: err.message });
  }
});

module.exports = router;
