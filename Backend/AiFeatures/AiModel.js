const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is not set in environment variables.");
}

const ai = new GoogleGenerativeAI(GEMINI_API_KEY);

const model = ai.getGenerativeModel({
    model: "gemini-1.5-flash"
});

const askResponse = async (prompt) => {
    const result = await model.generateContent(prompt);
    return result.response.text();
};

module.exports = { askResponse };