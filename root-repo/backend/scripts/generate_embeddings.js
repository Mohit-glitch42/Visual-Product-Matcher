const fs = require("fs").promises;
const path = require("path");
const { extractEmbedding, normalize } = require("../mobilenetSimilarity"); // adjust import as needed

// --- Configuration ---
// CORRECTED: Read from the 'backend' directory, not the 'scripts' directory
const INPUT_FILE_PATH = path.join(__dirname, "..", "products.json");
const OUTPUT_FILE_PATH = path.join(
  __dirname,
  "..",
  "products_with_embeddings.json"
);
const MODEL_EMBEDDING_SIZE = 1280; // Correct size for the MobileNet model
const CONCURRENCY_LIMIT = 5; // Set how many images to process at the same time

/**
 * Processes a single product to add an image embedding.
 */
async function processProduct(product) {
  const updatedProduct = { ...product, embedding: [] };

  try {
    if (!product.images || product.images.length === 0) {
      return updatedProduct;
    }

    const imageUrl = product.images[0];
    const embedding = await extractEmbedding({ url: imageUrl });
    const normalizedEmbedding = normalize(embedding);

    if (
      !normalizedEmbedding ||
      normalizedEmbedding.length !== MODEL_EMBEDDING_SIZE
    ) {
      console.error(
        `Invalid embedding for '${
          product.title
        }'. Expected ${MODEL_EMBEDDING_SIZE}, got ${
          normalizedEmbedding?.length || 0
        }.`
      );
      return updatedProduct;
    }

    updatedProduct.embedding = normalizedEmbedding;
    return updatedProduct;
  } catch (error) {
    console.error(
      `Failed to generate embedding for '${product.title}': ${error.message}`
    );
    return updatedProduct;
  }
}

/**
 * Main function to read products, generate embeddings with a concurrency limit, and save.
 */
async function generateEmbeddings() {
  console.log(`🚀 Starting embedding generation from: ${INPUT_FILE_PATH}`);
  try {
    const rawData = await fs.readFile(INPUT_FILE_PATH, "utf8");
    const data = JSON.parse(rawData);
    const products = data.products || [];
    const updatedProducts = [];

    console.log(
      `Found ${products.length} products to process with a concurrency limit of ${CONCURRENCY_LIMIT}.`
    );

    for (let i = 0; i < products.length; i += CONCURRENCY_LIMIT) {
      const batch = products.slice(i, i + CONCURRENCY_LIMIT);
      console.log(
        `Processing batch ${Math.floor(i / CONCURRENCY_LIMIT) + 1}...`
      );

      const promises = batch.map((product) => processProduct(product));
      const results = await Promise.all(promises);

      updatedProducts.push(...results);
    }

    const successCount = updatedProducts.filter(
      (p) => p.embedding && p.embedding.length > 0
    ).length;
    const failureCount = products.length - successCount;

    console.log("\n--- Generation Complete ---");
    console.log(
      `✅ Successfully generated embeddings for ${successCount} products.`
    );
    console.log(`❌ Failed or skipped ${failureCount} products.`);
    console.log("---------------------------\n");

    console.log(`Writing results to ${OUTPUT_FILE_PATH}...`);
    const outputData = { ...data, products: updatedProducts };
    await fs.writeFile(
      OUTPUT_FILE_PATH,
      JSON.stringify(outputData, null, 2),
      "utf8"
    );
    console.log("✨ All done!");
  } catch (error) {
    console.error(
      "❌ A critical error occurred during the script execution:",
      error
    );
  }
}

generateEmbeddings();
