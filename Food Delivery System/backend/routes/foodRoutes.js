const express = require("express");
const router = express.Router();
const Food = require("../models/Food");


router.post("/", async (req, res) => {
  const food = new Food(req.body);
  await food.save();
  res.json(food);
})
router.get("/", async (req, res) => {
  const foods = await Food.find();
  res.json(foods);
});


router.delete("/:id", async (req, res) => {
  await Food.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;
