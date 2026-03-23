const { GoogleGenAI } = require("@google/genai");
const sharp = require("sharp");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const EMBEDDING_MODEL = "gemini-embedding-2-preview";
const EMBEDDING_DIMENSIONS = 768; // smaller for storage efficiency, still high quality

let aiClient = null;

const getClient = () => {
    if (!aiClient) {
        if (!GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not set in environment variables.");
        }
        aiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    }
    return aiClient;
};

/**
 * Preprocess image buffer: resize to optimal size, convert to PNG, return base64
 */
const preprocessImage = async (imageBuffer) => {
    const processed = await sharp(imageBuffer)
        .resize(512, 512, { fit: "inside", withoutEnlargement: false })
        .png()
        .toBuffer();
    return processed.toString("base64");
};

/**
 * Generate embedding for an image buffer only (used for search queries)
 */
const getImageEmbedding = async (imageBuffer) => {
    const ai = getClient();
    const imgBase64 = await preprocessImage(imageBuffer);

    const response = await ai.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: [{
            inlineData: {
                mimeType: "image/png",
                data: imgBase64,
            },
        }],
        config: {
            outputDimensionality: EMBEDDING_DIMENSIONS,
        },
    });

    if (!response.embeddings || response.embeddings.length === 0) {
        throw new Error("No embedding returned from Gemini API");
    }

    return Array.from(response.embeddings[0].values);
};

/**
 * Generate a multimodal embedding combining image + product metadata
 * This creates richer embeddings for stored products
 */
const getProductEmbedding = async (imageBuffer, productName, category) => {
    const ai = getClient();
    const imgBase64 = await preprocessImage(imageBuffer);

    // Combine image with text metadata for a richer product embedding
    const textDescription = `Product: ${productName}. Category: ${category}.`;

    const response = await ai.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: {
            parts: [
                { text: textDescription },
                {
                    inlineData: {
                        mimeType: "image/png",
                        data: imgBase64,
                    },
                },
            ],
        },
        config: {
            outputDimensionality: EMBEDDING_DIMENSIONS,
        },
    });

    if (!response.embeddings || response.embeddings.length === 0) {
        throw new Error("No embedding returned from Gemini API");
    }

    return Array.from(response.embeddings[0].values);
};

module.exports = { getImageEmbedding, getProductEmbedding };