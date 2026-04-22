const Mood = require("../Models/Mood.Model");
const Product = require("../Models/Product.Model");
const User = require("../Models/User.Model");

const AUTO_MOOD_MAP = {
  "shoes": ["gym", "casual", "travel"],
  "formal wear": ["office", "wedding"],
  "sportswear": ["gym", "casual"],
  "ethnic wear": ["festival", "wedding"],
  "accessories": ["party", "casual", "office"],
  "electronics": ["gaming", "study", "office"],
  "luggage": ["travel", "vacation"],
  "home decor": ["home", "romance"]
};

/**
 * createMood(name, label, emoji)
 */
const createMood = async (name, label, emoji) => {
  const existing = await Mood.findOne({ name: name.toLowerCase() });
  if (existing) throw new Error("Mood already exists");

  const mood = new Mood({
    name: name.toLowerCase(),
    label,
    emoji,
    isActive: true
  });
  return await mood.save();
};

/**
 * adminAssignMood(productId, moods)
 */
const adminAssignMood = async (productId, moods) => {
  const validatedMoods = [];
  for (const mName of moods) {
    const mood = await Mood.findOne({ name: mName.toLowerCase(), isActive: true });
    if (mood) validatedMoods.push(mood.name);
  }

  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found");

  // Merge with existing
  const currentMoods = new Set(product.moods || []);
  validatedMoods.forEach(m => currentMoods.add(m));

  product.moods = Array.from(currentMoods);
  
  if (product.moodAssignedBy === "auto") product.moodAssignedBy = "both";
  else if (product.moodAssignedBy === "none") product.moodAssignedBy = "admin";

  return await product.save();
};

/**
 * autoAssignMoods(productId)
 */
const autoAssignMoods = async (productId) => {
  try {
    const product = await Product.findById(productId);
    if (!product || !product.category) return;

    const category = product.category.toLowerCase().trim();
    const moodsToAssign = AUTO_MOOD_MAP[category];

    if (moodsToAssign && moodsToAssign.length > 0) {
      const currentMoods = new Set(product.moods || []);
      moodsToAssign.forEach(m => currentMoods.add(m.toLowerCase()));

      product.moods = Array.from(currentMoods);

      if (product.moodAssignedBy === "admin") product.moodAssignedBy = "both";
      else if (product.moodAssignedBy === "none") product.moodAssignedBy = "auto";

      await product.save();
    }
  } catch (error) {
    console.error(`Auto-assign mood failed for ${productId}:`, error);
  }
};

/**
 * selectMood(userId, moodName)
 */
const selectMood = async (userId, moodName) => {
  const mood = await Mood.findOne({ name: moodName.toLowerCase(), isActive: true });
  if (!mood) throw new Error("Mood not found");

  const products = await Product.find({ moods: moodName.toLowerCase(), status: "approved", isVisible: true })
    .sort({ rankScore: -1, createdAt: -1 })
    .limit(20);

  if (userId) {
    const user = await User.findById(userId);
    if (user) {
      user.lastMood = moodName.toLowerCase();
      user.moodHistory.push({
        mood: moodName.toLowerCase(),
        selectedAt: new Date(),
        productsSeen: products.length
      });
      await user.save();
    }
  }

  return products;
};

/**
 * getMoodSuggestions(userId)
 */
const getMoodSuggestions = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;

  const history = user.moodHistory || [];
  if (history.length === 0) return { lastMood: user.lastMood };

  // Favorite mood (most used)
  const counts = {};
  history.forEach(h => counts[h.mood] = (counts[h.mood] || 0) + 1);
  const favoriteMood = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);

  // Recent 5 unique moods
  const recentMoods = Array.from(new Set(history.map(h => h.mood).reverse())).slice(0, 5);

  return {
    lastMood: user.lastMood,
    favoriteMood,
    recentMoods
  };
};

/**
 * deleteMood(moodId)
 */
const deleteMood = async (moodId) => {
  const mood = await Mood.findById(moodId);
  if (!mood) return;

  const moodName = mood.name;

  // Bulk remove from products
  await Product.updateMany(
    { moods: moodName },
    { $pull: { moods: moodName } }
  );

  // Clean up moodAssignedBy status
  await Product.updateMany(
    { moods: { $size: 0 }, moodAssignedBy: { $ne: "none" } },
    { $set: { moodAssignedBy: "none" } }
  );

  await mood.deleteOne();
};

/**
 * getAnalytics()
 */
const getMoodAnalytics = async () => {
    const users = await User.find({}, 'moodHistory');
    const allSelections = users.flatMap(u => u.moodHistory);
    
    if (allSelections.length === 0) return { totalSelections: 0 };

    const counts = {};
    allSelections.forEach(s => counts[s.mood] = (counts[s.mood] || 0) + 1);

    const sortedMoods = Object.entries(counts).sort((a,b) => b[1] - a[1]);
    
    return {
        totalSelections: allSelections.length,
        mostSelected: sortedMoods[0] ? { mood: sortedMoods[0][0], count: sortedMoods[0][1] } : null,
        leastSelected: sortedMoods[sortedMoods.length - 1] ? { mood: sortedMoods[sortedMoods.length - 1][0], count: sortedMoods[sortedMoods.length - 1][1] } : null
    };
};

module.exports = {
  createMood,
  adminAssignMood,
  autoAssignMoods,
  selectMood,
  getMoodSuggestions,
  deleteMood,
  getMoodAnalytics
};
