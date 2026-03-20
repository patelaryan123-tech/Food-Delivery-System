const express = require("express");
const app = express();

console.log("Testing /*");
try {
    app.get("/*", (req, res) => res.send("ok"));
    console.log("/* worked");
} catch (e) {
    console.error("/* failed", e.message);
}

console.log("Testing /.*");
try {
    app.get("/.*", (req, res) => res.send("ok"));
    console.log("/.* worked");
} catch (e) {
    console.error("/.* failed", e.message);
}

console.log("Testing regex");
try {
    app.get(/.*/, (req, res) => res.send("ok"));
    console.log("regex worked");
} catch (e) {
    console.error("regex failed", e.message);
}
