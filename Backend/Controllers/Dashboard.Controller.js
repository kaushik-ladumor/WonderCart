const mongoose = require("mongoose");
const SubOrder = require("../Models/SubOrder.Model");
const Product = require("../Models/Product.Model");
const User = require("../Models/User.Model");
const WalletTransaction = require("../Models/WalletTransaction.Model");

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
        dateFormat = "%Y-%m-%d";
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        previousStartDate.setDate(startDate.getDate() - 90);
        dateFormat = "%Y-%m-%d";
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        previousStartDate.setFullYear(startDate.getFullYear() - 1);
        dateFormat = "%Y-%m-%d"; 
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
                image: { $first: "$items.image" },
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
                currentStock: { $sum: { $map: { input: "$productDoc.variants", as: "v", in: { $sum: "$$v.sizes.stock" } } } },
                image: { $ifNull: ["$image", { $arrayElemAt: [{ $arrayElemAt: ["$productDoc.variants.images", 0] }, 0] }] },
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
            { $limit: 400 }
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
      if (period === '30d') label = `W${label.split('-')[1]}`;
      return {
        _id: c._id,
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

exports.getSellerEarnings = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user.userId);
    
    // 1. Get Wallet Balance (Available)
    const user = await User.findById(sellerId);
    const availableBalance = user.walletBalance || 0;

    // 2. Get SubOrders for Stats
    const orders = await SubOrder.find({ seller: sellerId });
    
    const totalEarnings = orders
      .filter(o => o.status === "delivered")
      .reduce((sum, o) => sum + (o.sellerPayout || 0), 0);
      
    const pendingPayouts = orders
      .filter(o => !["delivered", "cancelled", "returned"].includes(o.status))
      .reduce((sum, o) => sum + (o.sellerPayout || 0), 0);

    // 3. Get Recent Transactions
    const transactions = await WalletTransaction.find({ user: sellerId })
      .sort({ createdAt: -1 })
      .limit(20);

    // 4. Chart Data (Zero-filled based on period)
    const { period = "30d" } = req.query;
    let daysToFetch = 30;
    if (period === "7d") daysToFetch = 7;
    if (period === "Yr" || period === "year") daysToFetch = 365;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToFetch);
    
    const dbData = await SubOrder.aggregate([
      { $match: { seller: sellerId, status: "delivered", deliveredAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$deliveredAt" } },
          value: { $sum: "$sellerPayout" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Zero-filling logic
    const dataMap = new Map(dbData.map(item => [item._id, item.value]));
    const finalChartData = [];
    for (let i = 0; i <= daysToFetch; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        finalChartData.push({
            name: dateStr,
            value: dataMap.get(dateStr) || 0
        });
    }

    // 5. Category Breakdown
    const categories = await SubOrder.aggregate([
      { $match: { seller: sellerId, status: "delivered" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.category",
          total: { $sum: "$items.price" }
        }
      }
    ]);

    const totalCatRevenue = categories.reduce((sum, c) => sum + c.total, 0);
    const formattedCategories = categories.map(c => ({
      name: c._id || "Other",
      percentage: totalCatRevenue > 0 ? Math.round((c.total / totalCatRevenue) * 100) : 0,
      color: c._id === "Electronics" ? "bg-[#2563eb]" : (c._id === "Footwear" ? "bg-[#10b981]" : "bg-[#64748b]")
    })).sort((a,b) => b.percentage - a.percentage).slice(0, 3);

    res.status(200).json({
      success: true,
      totalEarnings,
      availableBalance,
      pendingPayouts,
      nextPayoutDate: "Nov 05, 2026",
      transactions: transactions.map(t => ({
        id: t._id,
        date: t.createdAt,
        amount: t.amount,
        refId: t.refId || `TXN-${t._id.toString().slice(-8).toUpperCase()}`,
        status: t.type === "credit" ? "SUCCESS" : "PROCESSING"
      })),
      chartData: finalChartData,
      categories: formattedCategories
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
