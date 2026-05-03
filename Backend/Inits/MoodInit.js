const Mood = require("../Models/Mood.Model");

const initialMoods = [
  { name: "happy", label: "Happy", emoji: "😊" },
  { name: "romantic", label: "Romantic", emoji: "💖" },
  { name: "professional", label: "Professional", emoji: "💼" },
  { name: "casual", label: "Casual", emoji: "👕" },
  { name: "party", label: "Party", emoji: "🎉" },
  { name: "sporty", label: "Sporty", emoji: "🏃" },
  { name: "relaxed", label: "Relaxed", emoji: "🛋️" },
  { name: "festive", label: "Festive", emoji: "🏮" },
  { name: "bold", label: "Bold", emoji: "🔥" },
  { name: "elegant", label: "Elegant", emoji: "👗" },
  { name: "minimalist", label: "Minimalist", emoji: "⚪" },
  { name: "vibrant", label: "Vibrant", emoji: "🌈" },
  { name: "traditional", label: "Traditional", emoji: "🕌" },
  { name: "modern", label: "Modern", emoji: "🏙️" },
  { name: "adventurous", label: "Adventurous", emoji: "⛰️" },
  // Adding moods used in AUTO_MOOD_MAP to ensure they are available
  { name: "office", label: "Office", emoji: "🏢" },
  { name: "gym", label: "Gym", emoji: "🏋️" },
  { name: "travel", label: "Travel", emoji: "✈️" },
  { name: "wedding", label: "Wedding", emoji: "💒" },
  { name: "gaming", label: "Gaming", emoji: "🎮" },
  { name: "study", label: "Study", emoji: "📚" },
  { name: "vacation", label: "Vacation", emoji: "🏖️" },
  { name: "home", label: "Home", emoji: "🏠" },
];

const initMoods = async () => {
  try {
    for (const moodData of initialMoods) {
      const existing = await Mood.findOne({ name: moodData.name });
      if (!existing) {
        await Mood.create({ ...moodData, isActive: true });
      }
    }
    console.log("Standard moods initialized/verified successfully.");
  } catch (error) {
    console.error("Error initializing moods:", error);
  }
};

module.exports = initMoods;
