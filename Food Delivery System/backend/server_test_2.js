const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");

dotenv.config();

const app = express();

(async () => {
    try {
        console.log("Connecting DB...");
        await connectDB();
        console.log("DB Connected");

        console.log("Loading routes...");
        app.use("/api/orders", require("./routes/orderRoutes"));

        console.log("Serving static...");
        const rootPath = path.join(__dirname, "../frontend/dist");
        app.use(express.static(rootPath));

        console.log("Adding catch-all...");
        app.get("*", (req, res) => {
            res.sendFile(path.join(rootPath, "index.html"));
        });

        app.listen(5002, () => {
            console.log("Test Server 2 running");
        });
    } catch (err) {
        console.error("Error:", err);
    }
})();
