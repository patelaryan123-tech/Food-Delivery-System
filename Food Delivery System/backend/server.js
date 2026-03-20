const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/food", require("./routes/foodRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/coupons", require("./routes/couponRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/delivery", require("./routes/deliveryRoutes"));

// Static Files (Frontend)
const rootPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(rootPath));

// Catch-all route for SPA
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(rootPath, "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`➜ Local: http://localhost:${PORT}`);
  console.log(`➜ API:   http://localhost:${PORT}/api`);
});