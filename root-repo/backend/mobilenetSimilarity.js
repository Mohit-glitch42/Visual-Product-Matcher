const tf = require("@tensorflow/tfjs-node");
const mobilenet = require("@tensorflow-models/mobilenet");
const sharp = require("sharp");
const axios = require("axios");

let model = null;

async function loadModel() {
  if (!model) model = await mobilenet.load({ version: 2, alpha: 1.0 });
  return model;
}

async function readImageTensor(buffer) {
  const image = await sharp(buffer)
    .resize(224, 224)
    .toFormat("jpeg")
    .toBuffer();
  const tensor = tf.node
    .decodeImage(image, 3)
    .expandDims(0)
    .toFloat()
    .div(tf.scalar(127))
    .sub(tf.scalar(1));
  return tensor;
}

async function extractEmbedding({ buffer, url }) {
  const mod = await loadModel();
  let imgBuffer;
  try {
    if (url) {
      const res = await axios.get(url, { responseType: "arraybuffer" });
      imgBuffer = Buffer.from(res.data);
    } else if (buffer) {
      imgBuffer = buffer;
    } else {
      throw new Error("No image source provided");
    }
    const input = await readImageTensor(imgBuffer);
    // Use 'conv_preds' layer for embedding (bottleneck features)
    const embeddingTensor = mod.infer(input, "conv_preds");
    const embedding = embeddingTensor.dataSync();
    input.dispose();
    embeddingTensor.dispose();
    return Array.from(embedding);
  } catch (error) {
    console.error("Failed to extract embedding:", error);
    throw error;
  }
}

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, ai, idx) => sum + ai * b[idx], 0);
  const normA = Math.sqrt(a.reduce((sum, x) => sum + x * x, 0));
  const normB = Math.sqrt(b.reduce((sum, x) => sum + x * x, 0));
  return dot / (normA * normB);
}

function normalize(vec) {
  const norm = Math.sqrt(vec.reduce((sum, x) => sum + x * x, 0));
  return vec.map((x) => x / norm);
}

module.exports = { extractEmbedding, cosineSimilarity, normalize };
