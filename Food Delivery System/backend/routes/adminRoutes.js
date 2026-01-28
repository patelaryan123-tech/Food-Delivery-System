const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Admin Panel API Working ✅" });
});

module.exports = router;
