const Product = require("../Models/Product.Model");
const { getImageEmbedding } = require("../Services/Embedding");

// Minimum cosine similarity to consider a match relevant
const SIMILARITY_THRESHOLD = 0.45;
const MAX_RESULTS = 5;

/**
 * Compute cosine similarity between two vectors
 */
const cosineSimilarity = (a, b) => {
    if (!a || !b || a.length === 0 || b.length === 0 || a.length !== b.length) {
        return 0;
    }
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0) return 0;
    return dot / denominator;
};

const VisualSearch = async (req, res) => {
    try {
        // Find the image file from the request
        const file = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);

        if (!file || !file.buffer) {
            return res.status(400).json({
                success: false,
                message: "No image file provided",
                hint: "Ensure you are sending 'multipart/form-data' with a file field named 'images'.",
            });
        }

        console.log(`[VisualSearch] Processing image: ${file.originalname}, size: ${file.size} bytes`);

        // Generate embedding for the uploaded query image
        const queryVector = await getImageEmbedding(file.buffer);
        console.log(`[VisualSearch] Query vector generated, dimensions: ${queryVector.length}`);

        // Fetch only approved products that have valid vectors
        const products = await Product.find({
            vector: { $exists: true, $not: { $size: 0 } },
            status: "approved",
        }).select("-__v");

        console.log(`[VisualSearch] Found ${products.length} products with embeddings`);

        if (products.length === 0) {
            return res.json({
                success: true,
                results: [],
                message: "No products have been indexed for visual search yet.",
            });
        }

        // Score all products by cosine similarity
        const scored = products
            .map((p) => {
                const score = cosineSimilarity(queryVector, p.vector);
                return { product: p, score };
            })
            .filter((s) => s.score >= SIMILARITY_THRESHOLD)
            .sort((a, b) => b.score - a.score)
            .slice(0, MAX_RESULTS);

        console.log(
            `[VisualSearch] Matches above threshold (${SIMILARITY_THRESHOLD}):`,
            scored.map((s) => `${s.product.name}: ${s.score.toFixed(4)}`)
        );

        if (scored.length === 0) {
            return res.json({
                success: true,
                results: [],
                message: "No similar products found. Try uploading a clearer image or a product from our catalog.",
            });
        }

        // Return products with their similarity scores
        const results = scored.map((s) => {
            const product = s.product.toObject();
            // Remove the large vector array from the response
            delete product.vector;
            return {
                ...product,
                similarityScore: parseFloat(s.score.toFixed(4)),
            };
        });

        res.json({
            success: true,
            results,
            message: `Found ${results.length} similar product(s).`,
        });

    } catch (err) {
        console.error("[VisualSearch] Error:", err);
        res.status(500).json({
            success: false,
            message: "Error processing image. Please try again.",
            error: process.env.NODE_ENV === "development" ? err.message : undefined,
        });
    }
};

module.exports = { VisualSearch };