const express = require("express");
const app = express();

try {
    console.log("Loading routes...");
    app.use("/api/orders", require("./routes/orderRoutes"));
    console.log("Loaded orders");

    app.use("/api/food", require("./routes/foodRoutes"));
    console.log("Loaded food");

    app.use("/api/admin", require("./routes/adminRoutes"));
    console.log("Loaded admin");

    app.listen(5001, () => {
        console.log("Test Server running");
    });
} catch (err) {
    console.error("Error:", err);
}
