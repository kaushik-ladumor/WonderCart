const SubOrder = require("../Models/SubOrder.Model");
const TopSeller = require("../Models/TopSeller.Model");
const Product = require("../Models/Product.Model");

const calculateTopSellers = async (category = null) => {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const thirtyHoursAgo = new Date(now.getTime() - 30 * 60 * 60 * 1000);
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

    // Filter by date range and status (exclude cancelled)
    const matchCurrent = {
      createdAt: { $gte: twentyFourHoursAgo, $lte: now },
      status: { $nin: ["CANCELLED", "RETURNED"] }
    };

    const matchPrevious = {
      createdAt: { $gte: thirtyHoursAgo, $lte: sixHoursAgo },
      status: { $nin: ["CANCELLED", "RETURNED"] }
    };

    // Helper function to aggregate top sellers
    const getAggregatedSellers = async (matchStage, catFilter) => {
      const pipeline = [
        { $match: matchStage },
        { $unwind: "$items" }
      ];

      // If category filter is provided, we need to join with products to filter by category
      // unless we add category to SubOrder items (which we will do in next step)
      // For now, let's aggregate all and filter after group or use $lookup
      
      pipeline.push(
        {
          $group: {
            _id: "$items.product",
            salesCount: { $sum: "$items.quantity" },
          }
        },
        { $sort: { salesCount: -1 } },
        { $limit: 100 } // Top 100
      );

      const results = await SubOrder.aggregate(pipeline);
      
      // Now we need to filter by category if catFilter is present
      // and populate rank
      let finalResults = [];
      let rank = 1;

      for (const item of results) {
        if (catFilter) {
          const prod = await Product.findById(item._id);
          if (prod && prod.category === catFilter) {
            finalResults.push({
              productId: item._id,
              salesCount: item.salesCount,
              rank: rank++
            });
          }
        } else {
          finalResults.push({
            productId: item._id,
            salesCount: item.salesCount,
            rank: rank++
          });
        }
        if (finalResults.length >= 100) break;
      }

      return finalResults;
    };

    const currentRanksList = await getAggregatedSellers(matchCurrent, category);
    const previousRanksList = await getAggregatedSellers(matchPrevious, category);

    // Convert previous to map for quick lookup
    const prevRankMap = new Map();
    previousRanksList.forEach(item => {
      prevRankMap.set(item.productId.toString(), item.rank);
    });

    // Bulk operations for upsert
    const bulkOps = [];

    // Optionally we can get product details in one query for all products
    const productIds = currentRanksList.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    
    // Fetch SellerProfile for shop names
    const SellerProfile = require("../Models/SellerProfile.Model");
    const ownerIds = products.map(p => p.owner).filter(id => !!id);
    const sellerProfiles = await SellerProfile.find({ user: { $in: ownerIds } });
    const shopNameMap = new Map();
    sellerProfiles.forEach(sp => {
        shopNameMap.set(sp.user.toString(), sp.shopName);
    });

    // Convert products to map
    const productMap = new Map();
    products.forEach(p => {
        productMap.set(p._id.toString(), p);
    });

    for (const item of currentRanksList) {
      const prod = productMap.get(item.productId.toString());
      if (!prod) continue; // Skip if product deleted
      
      let productImage = "";
      let price = 0;
      let originalPrice = 0;
      
      if (prod.variants && prod.variants.length > 0) {
        if (prod.variants[0].images && prod.variants[0].images.length > 0) {
            productImage = prod.variants[0].images[0];
        }
        if (prod.variants[0].sizes && prod.variants[0].sizes.length > 0) {
            price = prod.variants[0].sizes[0].sellingPrice;
            originalPrice = prod.variants[0].sizes[0].originalPrice;
        }
      }

      const prevRank = prevRankMap.get(item.productId.toString()) || null;

      const updateData = {
        productName: prod.name,
        productImage,
        price,
        originalPrice,
        rating: prod.average_rating || 0,
        reviewCount: prod.total_reviews || 0,
        salesCount: item.salesCount,
        rank: item.rank,
        previousRank: prevRank,
        category: category || "All",
        shopName: shopNameMap.get(prod.owner?.toString()) || "Aura Official",
        updatedAt: new Date()
      };

      bulkOps.push({
        updateOne: {
          filter: { productId: item.productId, category: category || "All" },
          update: { $set: updateData },
          upsert: true
        }
      });
    }

    if (bulkOps.length > 0) {
      await TopSeller.bulkWrite(bulkOps);
    }
    
    // Remove products that are no longer in top 100 for this category
    if (productIds.length > 0) {
       await TopSeller.deleteMany({
          category: category || "All",
          productId: { $nin: productIds }
       });
    } else {
        // Clear all if no sales
       await TopSeller.deleteMany({ category: category || "All" });
    }

    return currentRanksList.length;
  } catch (error) {
    console.error("Error calculating top sellers:", error);
    throw error;
  }
};

module.exports = calculateTopSellers;
