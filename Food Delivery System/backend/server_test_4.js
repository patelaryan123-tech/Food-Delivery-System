const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");

console.log("1. Config dotenv");
dotenv.config();

console.log("2. Connect DB");
connectDB(); // Async, but we don't await in server.js

const app = express();
console.log("3. App created");
app.use(express.json());

const rootPath = path.join(__dirname, "../frontend/dist");
console.log("4. Root path:", rootPath);

console.log("5. Setting static");
try {
    app.use(express.static(rootPath));
    console.log("5. Static set");
} catch (e) {
    console.error("Error setting static:", e);
}

console.log("6. Setting catch-all");
try {
    app.get("*", (req, res) => {
        res.sendFile(path.join(rootPath, "index.html"));
    });
    console.log("6. Catch-all set");
} catch (e) {
    console.error("Error setting catch-all:", e);
}

const PORT = 5003;
console.log("7. Listening...", PORT);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
