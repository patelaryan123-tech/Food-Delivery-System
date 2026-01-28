const express = require("express");
const { addToCart } = require("../controllers/cartController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/add", auth, addToCart);

module.exports = router;
