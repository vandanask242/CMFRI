// search.js
const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

// PostgreSQL connection using .env
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// GET /api/species?q=searchTerm
router.get("/", async (req, res) => {
  const search = req.query.q || "";

  try {
    const result = await pool.query(
      "SELECT name, details, image FROM species WHERE name ILIKE $1 LIMIT 10",
      [`${search}%`]
    );

    if (result.rows.length === 0) {
      return res.json({ found: false, species: [] });
    }

    const speciesData = result.rows.map((row) => {
      let base64Image = null;
      if (row.image) {
        const isPNG = row.image[0] === 0x89 && row.image[1] === 0x50;
        const mimeType = isPNG ? "image/png" : "image/jpeg";
        base64Image = `data:${mimeType};base64,${row.image.toString("base64")}`;
      }
      return {
        name: row.name,
        description: row.details,
        image: base64Image,
      };
    });

    res.json({ found: true, species: speciesData });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
