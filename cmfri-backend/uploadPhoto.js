// upload.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { Pool } = require("pg");

const router = express.Router();
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Ensure uploads folder exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ML fallback for species
async function runModel(fileName) {
  const lower = fileName.toLowerCase();
  const speciesMap = [
    { keywords: ["kleinii"], name: "Alepes kleinii" },
    { keywords: ["neglectus"], name: "Amphioctopus neglectus" },
    { keywords: ["chacunda"], name: "Anodontostoma chacunda" },
    { keywords: ["thoracata"], name: "Escualosa thoracata" },
    { keywords: ["nehereus"], name: "Harpadon nehereus" },
    { keywords: ["diacanthus"], name: "Epinephelus diacanthus" },
    { keywords: ["heberi"], name: "Caranx heberi" },
    { keywords: ["filamentosus"], name: "Gerres filamentosus" },
    { keywords: ["affinis"], name: "Euthynnus affinis" },
    { keywords: ["dactyloptena", "spp"], name: "Dactyloptena spp" }, // ✅ new spec
  ];

  for (const sp of speciesMap) {
    if (sp.keywords.some(k => lower.includes(k))) return { success: true, speciesName: sp.name };
  }
  return { success: false };
}

// POST /upload-photo
router.post("/", upload.single("photo"), async (req, res) => {
  const filePath = req.file?.path;

  try {
    if (!filePath) return res.status(400).json({ error: "No file uploaded" });

    const photoBuffer = fs.readFileSync(filePath);
    const uploadedImageBase64 = `data:image/png;base64,${photoBuffer.toString("base64")}`;

    const userId = req.body.user_id || null;
    const name = req.body.name || "Unknown"; // <-- use 'name'

    const modelResult = req.body.species_name
      ? { success: true, speciesName: req.body.species_name.trim() }
      : await runModel(req.file.originalname);

    if (modelResult.success) {
      const result = await pool.query(
        "SELECT * FROM species WHERE name ILIKE $1 LIMIT 1",
        [`%${modelResult.speciesName}%`]
      );

      if (result.rows.length > 0) {
        const species = result.rows[0];
        const speciesImageBase64 = species.image
          ? `data:image/png;base64,${species.image.toString("base64")}`
          : null;

        return res.json({
          status: "matched",
          title: `✅ Species Found: ${species.name}`,
          message: species.details,
          imageBase64: speciesImageBase64,
        });
      }
    }

    // Insert new species with user name
    await pool.query(
      `INSERT INTO new_species_data (species_photo, sender_details) VALUES ($1, $2)`,
      [photoBuffer, JSON.stringify({ user_id: userId, name })]
    );

    res.json({
      status: "new_species",
      title: "New Species",
      message: "The image has been sent to admin for review.",
      imageBase64: uploadedImageBase64,
    });
  } catch (err) {
    console.error("Error processing photo:", err);
    res.status(500).json({ error: "Failed to process photo" });
  } finally {
    if (filePath) fs.unlink(filePath, () => {});
  }
});

module.exports = router;
