//similarity.js
const axios = require("axios");

const clamp01 = (v) => Math.max(0, Math.min(1, v));

// Map vendor-specific result to normalized 0..1 score
const normalizeDeepAI = (score) => {
  // Example: if provider returns distance, convert to similarity
  // Here assume provider returns 0..1 similarity; clamp for safety
  return clamp01(score);
};

async function compareImages(bufferOrUrlA, bufferOrUrlB, provider, apiKey) {
  if (provider === "deepai") {
    const FormData = require("form-data");
    const form = new FormData();
    if (typeof bufferOrUrlA === "string") {
      form.append("image1", bufferOrUrlA);
    } else {
      form.append("image1", bufferOrUrlA, { filename: "query.jpg" });
    }
    if (typeof bufferOrUrlB === "string") {
      form.append("image2", bufferOrUrlB);
    } else {
      form.append("image2", bufferOrUrlB, { filename: "product.jpg" });
    }

    const res = await axios.post(
      "https://api.deepai.org/api/image-similarity",
      form,
      {
        headers: {
          "Api-Key": apiKey,
          ...form.getHeaders(),
        },
        timeout: 20000,
      }
    );
    const raw =
      res.data?.output?.distance ?? res.data?.output?.similarity ?? 0.0;
    const score = normalizeDeepAI(1 - (raw ?? 0));
    return score;
  }

  throw new Error("Unsupported similarity provider");
}

module.exports = { compareImages };
