const express = require("express");
const cors = require("cors");
const connectDB  = require("./config/db"); // Import the updated connectDB function
require("dotenv").config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/faqs", require("./routes/faqRoutes"));

app.get("/", (req, res) => res.send("FAQ API is running"));

// Export the app
module.exports = app;
