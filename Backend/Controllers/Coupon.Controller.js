const Coupon = require("../Models/Coupon.Model");
const CouponUsage = require("../Models/CouponUsage.Model");
const MasterOrder = require("../Models/MasterOrder.Model");

const createCoupon = async (req, res) => {
    try {
        const couponData = req.body;
        const coupon = await Coupon.create(couponData);
        res.status(201).json({ success: true, coupon });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json({ success: true, coupons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getCouponById = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
        res.json({ success: true, coupon });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
        res.json({ success: true, coupon });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
        res.json({ success: true, message: "Coupon deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const validateCoupon = async (req, res) => {
    const { code, items, subTotal, paymentMethod } = req.body;
    const userId = req.user.userId;
    const CouponService = require("../Services/Coupon.Service");

    try {
        const result = await CouponService.validateCoupon(code, userId, items, subTotal, paymentMethod);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getCouponReport = async (req, res) => {
    try {
        // Section 12 logic
        const report = await CouponUsage.aggregate([
            {
                $lookup: {
                    from: "coupons",
                    localField: "coupon",
                    foreignField: "_id",
                    as: "couponData"
                }
            },
            { $unwind: "$couponData" },
            {
                $group: {
                    _id: "$coupon",
                    code: { $first: "$couponData.code" },
                    type: { $first: "$couponData.couponType" },
                    totalRedeemed: { $sum: 1 },
                    totalDiscountGiven: { $sum: "$discountApplied" }
                }
            },
            { $sort: { totalRedeemed: -1 } }
        ]);

        const monthlyStats = await MasterOrder.aggregate([
            {
                $match: {
                    coupon: { $exists: true, $ne: null },
                    paymentStatus: "paid"
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    count: { $sum: 1 },
                    totalDiscount: { $sum: "$couponDiscount" }
                }
            }
        ]);

        res.json({ success: true, report, monthlyStats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const mongoose = require("mongoose");

const getAvailableCoupons = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { onlyAvailable } = req.query;
        const now = new Date();
        
        const coupons = await Coupon.find({
            status: "active",
            $or: [
                { targetType: "all" },
                { targetType: "new_users" },
                { allowedUsers: userId }
            ],
            $or: [
                { neverExpires: true },
                { endDate: { $gt: now } }
            ],
            startDate: { $lte: now }
        }).sort({ createdAt: -1 }).lean();

        // Count usage per coupon for this user
        const usages = await CouponUsage.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId), status: { $in: ['used', 'locked'] } } },
            { $group: { _id: "$coupon", count: { $sum: 1 } } }
        ]);

        const usageMap = {};
        usages.forEach(u => {
            usageMap[u._id.toString()] = u.count;
        });

        // Check for new user status
        const orderCount = await MasterOrder.countDocuments({ 
            user: userId, 
            status: { $ne: "cancelled" } 
        });

        let resultCoupons = coupons.map(c => {
            const userUsedCount = usageMap[c._id.toString()] || 0;
            const isUsed = userUsedCount >= (c.usageLimitPerUser || 1);
            
            // Determine if it should be shown
            let isEligible = true;
            if (c.targetType === 'new_users' && orderCount > 0 && !isUsed) isEligible = false;
            if (c.usageLimitTotal !== null && c.usedCount >= c.usageLimitTotal && !isUsed) isEligible = false;

            return { ...c, isUsed, isEligible };
        }).filter(c => c.isEligible);

        if (onlyAvailable === 'true') {
            resultCoupons = resultCoupons.filter(c => !c.isUsed);
        }

        res.json({ success: true, coupons: resultCoupons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
    getCouponReport,
    getAvailableCoupons
};
