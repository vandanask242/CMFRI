const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const router = express.Router();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, mobile, email, userType, password } = req.body;
    if (!name || !mobile || !email || !userType || !password)
      return res.status(400).json({ error: "All fields required" });

    // Check if email already exists
    const existingEmail = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (existingEmail.rows.length) return res.status(400).json({ error: "Email already exists" });

    // Check if mobile already exists
    const existingMobile = await pool.query("SELECT * FROM users WHERE mobile=$1", [mobile]);
    if (existingMobile.rows.length) return res.status(400).json({ error: "Mobile number already exists" });

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (name, mobile, email, user_type, password) 
       VALUES ($1,$2,$3,$4,$5) RETURNING id, name, email`,
      [name, mobile, email, userType, hashed]
    );

    const user = result.rows[0];

    // Generate JWT including name
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "365d" }
    );

    // Save token in DB
    await pool.query("UPDATE users SET jwt_token=$1 WHERE id=$2", [token, user.id]);

    res.json({ jwtToken: token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// Login
router.post("/login", async (req, res) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password) return res.status(400).json({ error: "Mobile & password required" });

    const userResult = await pool.query("SELECT * FROM users WHERE mobile=$1", [mobile]);
    if (!userResult.rows.length) return res.status(400).json({ error: "User not found" });

    const match = await bcrypt.compare(password, userResult.rows[0].password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    // Include name in JWT
    const token = jwt.sign(
      { 
        id: userResult.rows[0].id, 
        email: userResult.rows[0].email, 
        name: userResult.rows[0].name 
      },
      process.env.JWT_SECRET,
      { expiresIn: "365d" }
    );

    await pool.query("UPDATE users SET jwt_token=$1 WHERE id=$2", [token, userResult.rows[0].id]);
    res.json({ jwtToken: token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get profile
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await pool.query(
      "SELECT id, name, mobile, email, user_type, created_at FROM users WHERE id=$1",
      [decoded.id]
    );

    if (!user.rows.length) return res.status(404).json({ error: "User not found" });

    res.json({ user: user.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;
