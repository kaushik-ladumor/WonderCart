const express = require("express");
const TopSeller = require("../Models/TopSeller.Model");

const router = express.Router();

// GET /api/top-sellers
router.get("/", async (req, res) => {
  try {
    const { category, limit = 20, page = 1 } = req.query;
    
    const query = { category: category || "All" };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const total = await TopSeller.countDocuments(query);
    const topSellers = await TopSeller.find(query)
      .populate("productId", "average_rating total_reviews")
      .sort({ rank: 1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    res.json({
      success: true,
      data: topSellers,
      total,
      page: parseInt(page)
    });
  } catch (error) {
    console.error("Error fetching top sellers:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// GET /api/top-sellers/rising
router.get("/rising", async (req, res) => {
  try {
    const { category } = req.query;
    const query = { category: category || "All" };
    
    const sellers = await TopSeller.find(query).lean();
    
    // Calculate rank improvement: previousRank - rank
    // If previousRank is null, it was not in top 100, assume previous rank was 101
    const rising = sellers.map(seller => {
      const prev = seller.previousRank || 101;
      const improvement = prev - seller.rank;
      return { ...seller, rankImprovement: improvement };
    })
    .filter(seller => seller.rankImprovement > 0)
    .sort((a, b) => b.rankImprovement - a.rankImprovement)
    .slice(0, 5); // top 5
    
    res.json({
      success: true,
      data: rising
    });
  } catch (error) {
    console.error("Error fetching rising sellers:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// GET /api/top-sellers/categories
router.get("/categories", async (req, res) => {
  try {
    // Find all distinct categories, excluding 'All' as it is a global ranking
    const categories = await TopSeller.distinct("category", { category: { $ne: "All" } });
    
    const categoriesWithProduct = [];
    
    // Find #1 product for each category
    for (const cat of categories) {
       const topProduct = await TopSeller.findOne({ category: cat, rank: 1 });
       if (topProduct) {
         categoriesWithProduct.push({
           category: cat,
           topProduct
         });
       }
    }
    
    res.json({
      success: true,
      data: categoriesWithProduct
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
