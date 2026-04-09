const mongoose = require("mongoose");
const SubOrder = require("../Models/SubOrder.Model");
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
        dateFormat = "%Y-%m-%d";
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        previousStartDate.setDate(startDate.getDate() - 30);
        dateFormat = "%Y-%U";
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        previousStartDate.setDate(startDate.getDate() - 90);
        dateFormat = "%Y-%m";
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        previousStartDate.setFullYear(startDate.getFullYear() - 1);
        dateFormat = "%Y-%m"; 
        break;
      default:
        startDate.setDate(now.getDate() - 30);
        previousStartDate.setDate(startDate.getDate() - 30);
    }

    // Step 1: Basic Seller Info
    const totalProducts = await Product.countDocuments({ owner: sellerId });

    // Step 2: Main Aggregation Pipeline on SubOrders
    const statsResult = await SubOrder.aggregate([
      { $match: { seller: sellerId, createdAt: { $gte: previousStartDate, $lte: now } } },
      
      {
        $addFields: {
          isCurrentPeriod: { $gte: ["$createdAt", startDate] },
          isPreviousPeriod: { $lt: ["$createdAt", startDate] }
        }
      },

      {
        $facet: {
          // KPIs
          currentKPIs: [
            { $match: { isCurrentPeriod: true, status: { $ne: "cancelled" } } },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: "$subTotal" },
                totalOrders: { $sum: 1 },
                deliveredCount: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } }
              }
            }
          ],

          previousKPIs: [
            { $match: { isPreviousPeriod: true, status: { $ne: "cancelled" } } },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: "$subTotal" },
                totalOrders: { $sum: 1 }
              }
            }
          ],

          // Pipeline
          pipelineData: [
            { $match: { isCurrentPeriod: true } },
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
                revenue: { $sum: "$subTotal" }
              }
            }
          ],

          // Charts
          chartData: [
            { $match: { isCurrentPeriod: true, status: { $ne: "cancelled" } } },
            {
              $group: {
                _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
                revenue: { $sum: "$subTotal" },
                orders: { $sum: 1 }
              }
            },
            { $sort: { "_id": 1 } }
          ],

          // Top Products
          topProductsData: [
            { $match: { isCurrentPeriod: true, status: { $ne: "cancelled" } } },
            { $unwind: "$items" },
            {
              $group: {
                _id: "$items.product",
                totalSold: { $sum: "$items.quantity" },
                totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
                name: { $first: "$items.name" },
                category: { $first: "$items.category" }
              }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "_id",
                as: "productDoc"
              }
            },
            { $unwind: { path: "$productDoc", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                name: 1,
                totalSold: 1,
                totalRevenue: 1,
                currentStock: "$productDoc.stock",
                image: { $arrayElemAt: ["$productDoc.images", 0] },
                category: 1
              }
            }
          ],

          miniCharts: [
            { $match: { isCurrentPeriod: true } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                revenue: { $sum: "$subTotal" },
                orders: { $sum: 1 }
              }
            },
            { $sort: { "_id": -1 } },
            { $limit: 6 }
          ],

          healthStats: [
            { $match: { isCurrentPeriod: true, status: "delivered", deliveredAt: { $exists: true } } },
            {
              $project: {
                dispatchTime: { $divide: [{ $subtract: ["$deliveredAt", "$createdAt"] }, 1000 * 60 * 60 * 24] }
              }
            },
            {
              $group: {
                _id: null,
                avgDispatch: { $avg: "$dispatchTime" }
              }
            }
          ],

          cancelledCount: [
            { $match: { isCurrentPeriod: true, status: "cancelled" } },
            { $count: "count" }
          ]
        }
      }
    ]);

    const result = statsResult[0];

    // Product Growth
    const productGrowthTrend = await Product.aggregate([
      { $match: { owner: sellerId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": -1 } },
      { $limit: 6 }
    ]);

    // Cleanup & Format
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

    const revBars = result.miniCharts.map(d => d.revenue).reverse();
    const ordBars = result.miniCharts.map(d => d.orders).reverse();
    const prodBars = productGrowthTrend.map(d => d.count).reverse();
    
    const normalize = (arr) => {
      if (arr.length === 0) return [0,0,0,0,0,0];
      const max = Math.max(...arr, 1);
      return arr.map(v => (v / max) * 100);
    };

    const pipeline = {
      pending: { count: 0, revenue: 0 },
      processing: { count: 0, revenue: 0 },
      shipped: { count: 0, revenue: 0 },
      delivered: { count: 0, revenue: 0 },
      cancelled: { count: 0, revenue: 0 }
    };

    result.pipelineData.forEach(p => {
      let key = p._id.toLowerCase();
      // Strategy 1 status mapping for seller dashboard
      if (key === "pending" || key === "confirmed") {
        pipeline.pending.count += p.count;
        pipeline.pending.revenue += p.revenue;
      } else if (key === "processing" || key === "packed") {
        pipeline.processing.count += p.count;
        pipeline.processing.revenue += p.revenue;
      } else if (key === "shipped") {
        pipeline.shipped.count += p.count;
        pipeline.shipped.revenue += p.revenue;
      } else if (key === "delivered") {
        pipeline.delivered.count += p.count;
        pipeline.delivered.revenue += p.revenue;
      } else if (key === "cancelled") {
        pipeline.cancelled.count += p.count;
        pipeline.cancelled.revenue += p.revenue;
      }
    });

    const revenueChart = result.chartData.map(c => {
      let label = c._id;
      if(period === '30d') label = `W${label.split('-')[1]}`;
      return {
        label,
        revenue: c.revenue,
        orders: c.orders
      };
    });

    const canCount = result.cancelledCount[0]?.count || 0;
    const totalWithCan = tOrd + canCount;
    const returnRate = totalWithCan > 0 ? (canCount / totalWithCan) * 100 : 0;
    const satRate = tOrd > 0 ? (cKpis.deliveredCount / tOrd) * 100 : 0;
    const realDispatch = result.healthStats[0]?.avgDispatch || 1.1;

    res.status(200).json({
      success: true,
      kpis: {
        totalRevenue: tRev,
        totalOrders: tOrd,
        avgOrderValue: avgOrderValue,
        totalProducts: totalProducts,
        revenueChange: rChange > 0 ? `+${rChange.toFixed(1)}%` : `${rChange.toFixed(1)}%`,
        ordersChange: oChange > 0 ? `+${oChange.toFixed(1)}%` : `${oChange.toFixed(1)}%`,
        revenueBar: normalize(revBars),
        ordersBar: normalize(ordBars),
        productsBar: normalize(prodBars)
      },
      pipeline,
      revenueChart,
      topProducts: result.topProductsData.map(p => ({
         name: p.name, totalSold: p.totalSold, totalRevenue: p.totalRevenue, currentStock: p.currentStock || 0, image: p.image || null, category: p.category
      })),
      storeHealth: {
        satisfactionRate: parseFloat(satRate.toFixed(1)),
        monthlyGrowth: parseFloat(rChange.toFixed(1)),
        returnRate: parseFloat(returnRate.toFixed(1)),
        avgDispatchDays: parseFloat(realDispatch.toFixed(1))
      }
    });

  } catch (error) {
    console.error("Dashboard Aggregation Error:", error);
    res.status(500).json({ success: false, message: "Server error generating dashboard stats", error: error.message });
  }
};
