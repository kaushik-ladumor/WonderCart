const Mood = require("../Models/Mood.Model");
const MoodService = require("../Services/MoodService");

const getActiveMoods = async (req, res) => {
  try {
    const moods = await Mood.find({ isActive: true }).sort({ label: 1 });
    res.status(200).json({ success: true, data: moods });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllMoodsAdmin = async (req, res) => {
  try {
    const moods = await Mood.find({}).sort({ label: 1 });
    res.status(200).json({ success: true, data: moods });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createMood = async (req, res) => {
  try {
    const { name, label, emoji } = req.body;
    const mood = await MoodService.createMood(name, label, emoji);
    res.status(201).json({ success: true, data: mood });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateMood = async (req, res) => {
  try {
    const { id } = req.params;
    const { label, emoji } = req.body;
    const mood = await Mood.findByIdAndUpdate(id, { label, emoji }, { new: true });
    res.status(200).json({ success: true, data: mood });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const toggleMoodStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const mood = await Mood.findById(id);
    if (!mood) return res.status(404).json({ success: false, message: "Mood not found" });
    
    mood.isActive = !mood.isActive;
    await mood.save();
    res.status(200).json({ success: true, data: mood });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteMood = async (req, res) => {
  try {
    const { id } = req.params;
    await MoodService.deleteMood(id);
    res.status(200).json({ success: true, message: "Mood deleted and removed from all products" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getProductsByMood = async (req, res) => {
  try {
    const { moodName } = req.params;
    const userId = req.user?.userId;
    const products = await MoodService.selectMood(userId, moodName);

    if (products.length === 0) {
      return res.status(200).json({ success: true, message: "No products available for this mood yet", data: [] });
    }

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const getUserMoodHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const suggestions = await MoodService.getMoodSuggestions(userId);
    const User = require("../Models/User.Model");
    const user = await User.findById(userId, 'moodHistory');
    
    res.status(200).json({ 
        success: true, 
        data: {
            history: user.moodHistory,
            suggestions
        } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMoodAnalytics = async (req, res) => {
  try {
    const analytics = await MoodService.getMoodAnalytics();
    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getActiveMoods,
  getAllMoodsAdmin,
  createMood,
  updateMood,
  toggleMoodStatus,
  deleteMood,
  getProductsByMood,
  getUserMoodHistory,
  getMoodAnalytics
};
