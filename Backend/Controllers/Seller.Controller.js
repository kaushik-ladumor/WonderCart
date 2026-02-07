const mongoose = require("mongoose");
const Product = require("../Models/Product.Model");
const Order = require("../Models/Order.Model");

const sellerDashboard = async (req, res) => {
    try {
        const sellerId = new mongoose.Types.ObjectId(req.user.userId);

        // Get seller's products
        const productIds = await Product.find({ owner: sellerId }).distinct("_id");
        const productCount = productIds.length;

        // Get all orders containing seller's products
        const orders = await Order.find({
            "items.product": { $in: productIds }
        }).sort({ createdAt: -1 });

        // Initialize order status counts and earnings
        const orderStatus = {
            pending: { orderCount: 0, totalEarnings: 0 },
            processing: { orderCount: 0, totalEarnings: 0 },
            shipped: { orderCount: 0, totalEarnings: 0 },
            delivered: { orderCount: 0, totalEarnings: 0 },
            cancelled: { orderCount: 0, totalEarnings: 0 }
        };

        let totalEarnings = 0;

        // Calculate earnings per status
        orders.forEach(order => {
            const sellerItems = order.items.filter(item =>
                productIds.some(id => id.equals(item.product))
            );

            const earning = sellerItems.reduce(
                (sum, item) => sum + (item.price * item.quantity),
                0
            );

            if (orderStatus[order.status]) {
                orderStatus[order.status].orderCount += 1;
                orderStatus[order.status].totalEarnings += earning;
                totalEarnings += earning;
            }
        });

        const orderCount = orders.length;
        const deliveredCount = orderStatus.delivered.orderCount;
        const successRate = orderCount > 0 ? Math.round((deliveredCount / orderCount) * 100) : 0;
        const avgOrderValue = orderCount > 0 ? (totalEarnings / orderCount) : 0;

        res.json({
            productCount,
            orderCount,
            totalEarnings,
            avgOrderValue,
            successRate,
            orderStatus
        });

    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).json({ message: "Server error loading dashboard" });
    }
};

module.exports = { sellerDashboard };