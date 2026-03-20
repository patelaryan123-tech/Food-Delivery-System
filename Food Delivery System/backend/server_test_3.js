console.log("1. Importing express");
const express = require("express");
console.log("2. Importing dotenv");
const dotenv = require("dotenv");
console.log("3. Config dotenv");
dotenv.config();
console.log("4. Importing path");
const path = require("path");
console.log("5. Importing db");
const connectDB = require("./config/db");
console.log("6. Done imports");

const app = express();
console.log("7. App created");
