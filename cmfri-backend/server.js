// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Routes
const authRoutes = require("./auth"); // if exists
const searchRoutes = require("./search");
const uploadPhotoRoutes = require("./uploadPhoto"); // match upload.js file name

// Middleware
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/species", searchRoutes);        // GET /api/species?q=...
app.use("/upload-photo", uploadPhotoRoutes);  // POST /upload-photo

// Test route
app.get("/", (req, res) => {
  res.send("🟢 CMFRI Backend Running");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
