const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is not set in environment variables.");
}

// Force v1 API version as some keys are restricted for v1beta endpoints
const ai = new GoogleGenerativeAI(GEMINI_API_KEY, { apiVersion: "v1" });

const createModel = (modelName) => ai.getGenerativeModel({ model: modelName });

let currentModelName = "gemini-1.5-flash"; // Standard v1 name
let currentModel = createModel(currentModelName);

const askResponse = async (prompt) => {
    try {
        const result = await currentModel.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("🤖 Gemini AI Error:", error.message);
        
        // Handle 404 or specific model errors by falling back to gemini-1.0-pro
        if ((error.status === 404 || error.message.includes("not found")) && currentModelName !== "gemini-1.0-pro") {
            console.warn(`⚠️ ${currentModelName} not found. Falling back to gemini-1.0-pro...`);
            currentModelName = "gemini-1.0-pro";
            currentModel = createModel(currentModelName);
            return await askResponse(prompt); 
        }

        return "I'm currently resting. Please try again in a moment."; 
    }
};

module.exports = { askResponse };