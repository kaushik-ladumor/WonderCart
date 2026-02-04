const Product = require("../Models/Product.Model");
const Order = require("../Models/Order.Model");
const mongoose = require("mongoose");

const sellerDashboard = async (req, res) => {
    const sellerId = new mongoose.Types.ObjectId(req.user.userId);

    const productIds = await Product.find({ owner: sellerId }).distinct("_id");

    const productCount = productIds.length;

    const orderCount = await Order.countDocuments({
        "items.product": { $in: productIds }
    });

    const stats = await Order.aggregate([
        { $unwind: "$items" },
        { $match: { "items.product": { $in: productIds } } },
        {
            $group: {
                _id: "$status",
                orderCount: { $sum: 1 },
                totalEarnings: {
                    $sum: { $multiply: ["$items.price", "$items.quantity"] }
                }
            }
        }
    ]);

    const orderStatus = {
        pending: { orderCount: 0, totalEarnings: 0 },
        processing: { orderCount: 0, totalEarnings: 0 },
        shipped: { orderCount: 0, totalEarnings: 0 },
        delivered: { orderCount: 0, totalEarnings: 0 },
        cancelled: { orderCount: 0, totalEarnings: 0 }
    };

    stats.forEach(s => {
        orderStatus[s._id] = s;
    });

    res.json({ productCount, orderCount, orderStatus });
};

module.exports = { sellerDashboard };
