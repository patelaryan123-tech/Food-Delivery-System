const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

const rootPath = path.join(__dirname, "..");
app.use(express.static(rootPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(rootPath, "index.html"));
});

app.use("/api/orders", require("./routes/orderRoutes"));   
app.use("/api/food", require("./routes/foodRoutes"));     
app.use("/api/admin", require("./routes/adminRoutes"));    


app.get("/admin", (req, res) => {
  res.sendFile(path.join(rootPath, "admin.html"));
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
