const express = require("express");
const cors = require("cors");
const multer = require("multer");
const {
  extractEmbedding,
  cosineSimilarity,
  normalize,
} = require("./mobilenetSimilarity");
const fs = require("fs");
const path = require("path");

// --- CONFIGURATION ---
const PORT = process.env.PORT || 8000; // Use environment variable for port
const PRODUCTS_DATA_PATH = path.join(
  __dirname,
  "products_with_embeddings.json"
);

// --- INITIALIZATION ---
const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

let products = [];

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// --- DATA LOADING ---
try {
  const rawData = fs.readFileSync(PRODUCTS_DATA_PATH, "utf8");
  const data = JSON.parse(rawData);

  if (Array.isArray(data.products)) {
    products = data.products;
    // Normalize stored embeddings on server start for accurate comparisons
    products.forEach((p) => {
      if (p.embedding && p.embedding.length > 0) {
        p.embedding = normalize(p.embedding);
      }
    });
    console.log(
      `✅ Loaded and normalized ${products.length} products with embeddings.`
    );
  } else {
    throw new Error(
      "Loaded JSON 'products' field has an unexpected structure."
    );
  }
} catch (err) {
  console.error(
    "❌ Failed to load or parse products_with_embeddings.json:",
    err.message
  );
  // Exit if the core data file is missing or corrupt, as the app is non-functional.
  process.exit(1);
}

// --- HELPER FUNCTION ---
/**
 * Extracts an image embedding from an Express request object.
 * @param {object} req - The Express request object.
 * @returns {Promise<Array<number>|null>} The normalized embedding vector or null.
 */
async function getQueryEmbeddingFromRequest(req) {
  if (req.file) {
    console.log("Extracting embedding from uploaded file...");
    return extractEmbedding({ buffer: req.file.buffer });
  }

  if (req.body && typeof req.body.imageUrl === "string") {
    const { imageUrl } = req.body;
    console.log("Extracting embedding from imageUrl:", imageUrl);
    if (imageUrl.startsWith("data:image/")) {
      const base64Data = imageUrl.split(",")[1];
      const imageBuffer = Buffer.from(base64Data, "base64");
      return extractEmbedding({ buffer: imageBuffer });
    }
    return extractEmbedding({ url: imageUrl });
  }

  return null;
}

// --- API ROUTES ---
app.post("/api/search", upload.single("image"), async (req, res) => {
  try {
    const queryEmbeddingRaw = await getQueryEmbeddingFromRequest(req);

    if (!queryEmbeddingRaw) {
      return res
        .status(400)
        .json({ error: "Please provide an image file or a valid image URL." });
    }

    const queryEmbedding = normalize(queryEmbeddingRaw);
    console.log(
      "Query Embedding sample (first 5):",
      queryEmbedding.slice(0, 5)
    );

    console.log("Computing similarities...");
    const scoredProducts = products
      .map((product) => {
        if (
          product.embedding &&
          product.embedding.length === queryEmbedding.length
        ) {
          const score = cosineSimilarity(queryEmbedding, product.embedding);
          return { product, score };
        }
        return null; // Return null for products without valid embeddings
      })
      .filter(Boolean); // Filter out any null entries

    // Sort by score descending and take top 10 results
    const results = scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    console.log(`Returning ${results.length} matched results.`);
    return res.json({ results });
  } catch (error) {
    console.error("API /api/search error:", error.message);
    return res
      .status(500)
      .json({ error: "An unexpected error occurred during the search." });
  }
});

// --- SERVER START ---
app.listen(PORT, () => console.log(`🚀 API server running on port ${PORT}`));
