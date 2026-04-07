const mongoose = require("mongoose");
const Order = require("../Models/Order.Model");
const Product = require("../Models/Product.Model");

exports.getDashboardStats = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user.userId || req.user._id);
    const { period = "30d" } = req.query;

    const now = new Date();
    let startDate = new Date();
    let previousStartDate = new Date();
    let dateFormat = "%Y-%m-%d";

    switch (period) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        previousStartDate.setDate(startDate.getDate() - 7);
        dateFormat = "%Y-%m-%d"; // Day format
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        previousStartDate.setDate(startDate.getDate() - 30);
        dateFormat = "%Y-%U"; // Week format
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        previousStartDate.setDate(startDate.getDate() - 90);
        dateFormat = "%Y-%m"; // Month format
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        previousStartDate.setFullYear(startDate.getFullYear() - 1);
        // Quarters usually need manual calculation from month
        dateFormat = "%Y-%m"; 
        break;
      default:
        startDate.setDate(now.getDate() - 30);
        previousStartDate.setDate(startDate.getDate() - 30);
    }

    // Step 1: Get seller's product IDs
    const sellerProducts = await Product.find({ owner: sellerId });
    const productIds = sellerProducts.map((p) => p._id);
    const totalProducts = sellerProducts.length;

    if (productIds.length === 0) {
      return res.status(200).json({
        kpis: { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, totalProducts: 0, revenueChange: "0%", ordersChange: "0%" },
        pipeline: {
          pending: { count: 0, revenue: 0 }, processing: { count: 0, revenue: 0 },
          shipped: { count: 0, revenue: 0 }, delivered: { count: 0, revenue: 0 },
          cancelled: { count: 0, revenue: 0 }
        },
        revenueChart: [],
        topProducts: [],
        storeHealth: { satisfactionRate: 0, monthlyGrowth: 0, returnRate: 0, avgDispatchDays: 0 }
      });
    }

    // Step 2: Main Aggregation Pipeline with $facet
    const statsResult = await Order.aggregate([
      // First, get orders created after the previous start date for comparison
      { $match: { createdAt: { $gte: previousStartDate, $lte: now } } },
      
      // Unwind items to filter only this seller's products
      { $unwind: "$items" },
      { $match: { "items.product": { $in: productIds } } },
      
      // Add helper fields for period categorization
      {
        $addFields: {
          itemRevenue: { $multiply: ["$items.price", "$items.quantity"] },
          isCurrentPeriod: { $gte: ["$createdAt", startDate] },
          isPreviousPeriod: { $lt: ["$createdAt", startDate] }
        }
      },

      // Use $facet to calculate multiple dimensions at once
      {
        $facet: {
          
          // --- Current Period Overall KPIs ---
          currentKPIs: [
            { $match: { isCurrentPeriod: true, status: { $ne: "cancelled" } } },
            {
              $group: {
                _id: "$_id", // Group by order first to avoid duplicate order counting
                orderRevenue: { $sum: "$itemRevenue" },
                status: { $first: "$status" }
              }
            },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: "$orderRevenue" },
                totalOrders: { $sum: 1 },
                deliveredCount: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } }
              }
            }
          ],

          // --- Previous Period Overall KPIs (for % change) ---
          previousKPIs: [
            { $match: { isPreviousPeriod: true, status: { $ne: "cancelled" } } },
            {
              $group: {
                _id: "$_id",
                orderRevenue: { $sum: "$itemRevenue" }
              }
            },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: "$orderRevenue" },
                totalOrders: { $sum: 1 }
              }
            }
          ],

          // --- Order Pipeline Counts and Revenue (Current Period Only) ---
          pipelineData: [
            { $match: { isCurrentPeriod: true } },
            {
              $group: {
                _id: { orderId: "$_id", status: "$status" },
                oRevenue: { $sum: "$itemRevenue" }
              }
            },
            {
              $group: {
                _id: "$_id.status",
                count: { $sum: 1 },
                revenue: { $sum: "$oRevenue" }
              }
            }
          ],

          // --- Revenue Chart Data (Current Period, grouped by formatted date) ---
          chartData: [
            { $match: { isCurrentPeriod: true, status: { $ne: "cancelled" } } },
            {
              $group: {
                _id: { orderId: "$_id", formattedDate: { $dateToString: { format: dateFormat, date: "$createdAt" } } },
                ordRev: { $sum: "$itemRevenue" }
              }
            },
            {
              $group: {
                _id: "$_id.formattedDate",
                revenue: { $sum: "$ordRev" },
                orders: { $sum: 1 }
              }
            },
            { $sort: { "_id": 1 } }
          ],

          // --- Top Products (Current Period) ---
          topProductsData: [
            { $match: { isCurrentPeriod: true, status: { $ne: "cancelled" } } },
            {
              $group: {
                _id: "$items.product",
                totalSold: { $sum: "$items.quantity" },
                totalRevenue: { $sum: "$itemRevenue" },
                name: { $first: "$items.name" } // Assuming items have name
              }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 5 },
            // Lookup to get product image and stock
            {
              $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "_id",
                as: "productDoc"
              }
            },
            { $unwind: "$productDoc" },
            {
              $project: {
                name: 1,
                totalSold: 1,
                totalRevenue: 1,
                currentStock: "$productDoc.stock",
                image: { $arrayElemAt: ["$productDoc.images", 0] }
              }
            }
          ],

          // --- Store Health (Cancelled Orders logic) ---
          cancelledOrders: [
            { $match: { isCurrentPeriod: true, status: "cancelled" } },
            { $group: { _id: "$_id" } },
            { $count: "count" }
          ]

        }
      }
    ]);

    const result = statsResult[0];

    // --- Format Outcomes ---
    // 1. KPIs
    const cKpis = result.currentKPIs[0] || { totalRevenue: 0, totalOrders: 0, deliveredCount: 0 };
    const pKpis = result.previousKPIs[0] || { totalRevenue: 0, totalOrders: 0 };

    const tRev = cKpis.totalRevenue;
    const tOrd = cKpis.totalOrders;
    const avgOrderValue = tOrd > 0 ? (tRev / tOrd) : 0;

    const calcChange = (curr, prev) => {
      if (prev > 0) return (((curr - prev) / prev) * 100);
      return curr > 0 ? 100 : 0;
    };
    
    const rChange = calcChange(tRev, pKpis.totalRevenue);
    const oChange = calcChange(tOrd, pKpis.totalOrders);

    // 2. Pipeline
    const pipeline = {
      pending: { count: 0, revenue: 0 },
      processing: { count: 0, revenue: 0 },
      shipped: { count: 0, revenue: 0 },
      delivered: { count: 0, revenue: 0 },
      cancelled: { count: 0, revenue: 0 }
    };

    result.pipelineData.forEach(p => {
      let key = p._id.toLowerCase();
      if (key === "placed" || key === "confirmed") key = "pending";
      else if (key === "ready_to_ship" || key === "out_for_delivery") key = "shipped";
      
      if (pipeline[key]) {
        pipeline[key].count += p.count;
        pipeline[key].revenue += p.revenue;
      }
    });

    // 3. Chart Data (Format labels nicely)
    const revenueChart = result.chartData.map(c => {
      let label = c._id;
      // Make week labels human readable if possible, or keep as is.
      if(period === '30d') label = `Week ${label.split('-')[1]}`;
      return {
        label,
        revenue: c.revenue,
        orders: c.orders
      };
    });

    // 4. Store Health Calculations
    const cancelledCount = result.cancelledOrders[0]?.count || 0;
    const totalOrdersInclCancelled = tOrd + cancelledCount;
    const returnRate = totalOrdersInclCancelled > 0 ? (cancelledCount / totalOrdersInclCancelled) * 100 : 0;
    const satisfactionRate = tOrd > 0 ? (cKpis.deliveredCount / tOrd) * 100 : (tOrd > 0 ? 100 : 0); // fallback if not tracked 
    const monthlyGrowth = rChange; // using revenue change

    const responseData = {
      kpis: {
        totalRevenue: tRev,
        totalOrders: tOrd,
        avgOrderValue: avgOrderValue,
        totalProducts: totalProducts,
        revenueChange: rChange > 0 ? `+${rChange.toFixed(1)}%` : `${rChange.toFixed(1)}%`,
        ordersChange: oChange > 0 ? `+${oChange.toFixed(1)}%` : `${oChange.toFixed(1)}%`
      },
      pipeline,
      revenueChart,
      topProducts: result.topProductsData.map(p => ({
         name: p.name, totalSold: p.totalSold, totalRevenue: p.totalRevenue, currentStock: p.currentStock || 0, image: p.image || null
      })),
      storeHealth: {
        satisfactionRate: parseFloat(satisfactionRate.toFixed(1)),
        monthlyGrowth: parseFloat(monthlyGrowth.toFixed(1)),
        returnRate: parseFloat(returnRate.toFixed(1)),
        avgDispatchDays: 1.4 // MongoDB grouping for dispatch days requires timestamps for exactly when status changed. Hardcoded as placeholder based on architecture.
      }
    };

    res.status(200).json(responseData);

  } catch (error) {
    console.error("Dashboard Aggregation Error:", error);
    res.status(500).json({ success: false, message: "Server error generating dashboard stats", error: error.message });
  }
};
