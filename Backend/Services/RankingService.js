const Product = require("../Models/Product.Model");

/**
 * calculateScore(product)
 * formula: (salesCount * 0.5) + (ratingAverage * 0.3) + (reviewCount * 0.2) + (newBoost * 0.1)
 * newBoost = 10 if added in last 7 days, else 0
 */
const calculateScore = (product) => {
  try {
    const now = new Date();
    const createdAt = new Date(product.createdAt);
    const diffDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
    const newBoost = diffDays <= 7 ? 10 : 0;

    const score = 
      (product.salesCount || 0) * 0.5 +
      (product.ratingAverage || 0) * 0.3 +
      (product.reviewCount || 0) * 0.2 +
      newBoost * 0.1;

    return parseFloat(score.toFixed(2));
  } catch (error) {
    console.error(`Error calculating score for product ${product._id}:`, error);
    return 0;
  }
};

/**
 * assignTags(allProducts) — Bulk version for performance
 * - Reassigns all tags based on current stats across all products
 */
const assignTags = async (allProducts) => {
  try {
    const totalCount = allProducts.length;
    if (totalCount === 0) return;

    // 1. Sort by rankScore for isTrending (Top 20%)
    const sortedByScore = [...allProducts].sort((a, b) => b.rankScore - a.rankScore || b.createdAt - a.createdAt);
    const trendingLimit = Math.ceil(totalCount * 0.2);
    const trendingIds = new Set(sortedByScore.slice(0, trendingLimit).map(p => p._id.toString()));

    // 2. Sort by salesCount for isBestSeller (Top 20%)
    const sortedBySales = [...allProducts].sort((a, b) => b.salesCount - a.salesCount || b.createdAt - a.createdAt);
    const bestSellerLimit = Math.ceil(totalCount * 0.2);
    const bestSellerIds = new Set(sortedBySales.slice(0, bestSellerLimit).map(p => p._id.toString()));

    const now = new Date();

    for (let product of allProducts) {
      // isTrending
      product.tags.isTrending = trendingIds.has(product._id.toString());
      
      // isBestSeller
      product.tags.isBestSeller = bestSellerIds.has(product._id.toString());
      
      // isTopRated (Rating >= 4.0)
      product.tags.isTopRated = (product.ratingAverage || 0) >= 4.0;
      
      // isNewArrival (Within last 7 days)
      const diffDays = Math.floor((now - new Date(product.createdAt)) / (1000 * 60 * 60 * 24));
      product.tags.isNewArrival = diffDays <= 7;
    }
  } catch (error) {
    console.error("Error in assignTags:", error);
  }
};

/**
 * rankAllProducts()
 * - Yearly cron job logic
 */
const rankAllProducts = async () => {
  try {
    const products = await Product.find({});
    if (!products || products.length === 0) {
      console.log("[RANKING CRON] No products found to rank.");
      return;
    }

    // Phase 1: Calculate Score
    for (let product of products) {
      product.rankScore = calculateScore(product);
      product.lastRankedAt = new Date();
    }

    // Phase 2: Assign Tags (using fresh scores)
    await assignTags(products);

    // Phase 3: Save results
    let updatedCount = 0;
    for (let product of products) {
      try {
        await product.save();
        updatedCount++;
      } catch (saveError) {
        console.error(`Failed to save rank for product ${product._id}:`, saveError);
      }
    }

    console.log(`[RANKING CRON] Successfully updated ${updatedCount} products.`);
  } catch (error) {
    console.error("Error in rankAllProducts:", error);
  }
};

/**
 * onDeliveryConfirmed(productId)
 */
const onDeliveryConfirmed = async (productId) => {
  try {
    await Product.findByIdAndUpdate(productId, { $inc: { salesCount: 1 } });
  } catch (error) {
    console.error(`Error incrementing salesCount for ${productId}:`, error);
  }
};

/**
 * onReviewSubmitted(productId, newRating)
 */
const onReviewSubmitted = async (productId, newRating) => {
  try {
    const product = await Product.findById(productId);
    if (!product) return;

    const oldCount = product.reviewCount || 0;
    const oldAverage = product.ratingAverage || 0;
    const newCount = oldCount + 1;
    const newAverage = (oldAverage * oldCount + newRating) / newCount;

    product.reviewCount = newCount;
    product.ratingAverage = parseFloat(newAverage.toFixed(2));
    await product.save();
  } catch (error) {
    console.error(`Error updating rating for ${productId}:`, error);
  }
};

module.exports = {
  calculateScore,
  assignTags,
  rankAllProducts,
  onDeliveryConfirmed,
  onReviewSubmitted,
};
