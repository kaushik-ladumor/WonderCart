const express = require('express');
const router = express.Router();
const Deal = require('../Models/Deal');
const DealClick = require('../Models/DealClick');
const Product = require('../Models/Product.Model');
const User = require('../Models/User.Model');
const authMiddleware = require('../Middlewares/Auth');
const authorizeRoles = require('../Middlewares/authorizeRoles');
const validateDealMargin = require('../Middlewares/validateDealMargin');
const { calculateDealPrice } = require('../Utils/dealHelpers');
const transporter = require("../Middlewares/EmailConfig");
const { sendNotification, notifyAdmins } = require("../Utils/notificationHelper");

// Email helper for deals
const sendDealEmail = async (to, subject, text) => {
    try {
        await transporter.sendMail({
            from: '"WonderCart Deals" <wondercarthelp@gmail.com>',
            to,
            subject,
            text
        });
    } catch (error) {
        console.error('Email error:', error);
    }
};

/**
 * GET /api/deals
 * Public - Get all live deals
 */
router.get('/', async (req, res) => {
    try {
        const { category, dealType, sort, page = 1, limit = 20 } = req.query;
        
        // AUTO-ACTIVATE: Move approved deals to live if start time reached
        const now = new Date();
        await Deal.updateMany(
            { status: 'approved', startDateTime: { $lte: now } },
            { $set: { status: 'live' } }
        );

        // AUTO-EXPIRE: Move live deals to expired if end time reached
        await Deal.updateMany(
            { status: 'live', endDateTime: { $lt: now } },
            { $set: { status: 'expired' } }
        );

        let query = { status: 'live' };

        if (category && category !== 'All') query.category = category;
        if (dealType) query.dealType = dealType;

        let sortQuery = { createdAt: -1 };
        if (sort === 'discount') sortQuery = { discountValue: -1 };
        if (sort === 'endTime') sortQuery = { endDateTime: 1 };
        if (sort === 'popular') sortQuery = { claimedCount: -1 };

        const skip = (page - 1) * limit;
        const total = await Deal.countDocuments(query);
        const deals = await Deal.find(query)
            .populate('productIds', 'name variants rating reviewCount')
            .sort(sortQuery)
            .skip(skip)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: deals,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * GET /api/deals/lightning
 * Public - Get top lightning deals
 */
router.get('/lightning', async (req, res) => {
    try {
        const deals = await Deal.find({ status: 'live', dealType: 'flash' })
            .populate('productIds', 'name variants rating reviewCount fontColor')
            .sort({ endDateTime: 1 })
            .limit(10);
        res.json({ success: true, data: deals });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * GET /api/deals/:id
 * Public - Get deal details
 */
router.get('/:id', async (req, res) => {
    try {
        const deal = await Deal.findById(req.params.id).populate('productIds');
        if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });

        // Increment view count (fire and forget)
        DealClick.create({
            dealId: deal._id,
            userId: req.user ? req.user.userId : null,
            clickType: 'view'
        }).catch(err => console.error('Analytics Error:', err));

        res.json({ success: true, data: deal });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * POST /api/deals
 * Private (Seller) - Create a new deal with strict validations
 */
router.post('/', authMiddleware, authorizeRoles('seller'), async (req, res) => {
    try {
        const { productIds, dealType, discountType, discountValue, startDateTime, endDateTime, title, description, category, couponCode } = req.body;
        
        // 1. Validate Start Time (Admin Review Buffer - 8 mins slack for clock drift)
        const minStartTime = new Date(Date.now() + 8 * 60 * 1000);
        if (new Date(startDateTime) < minStartTime) {
            return res.status(400).json({ success: false, message: 'Start time must be at least 10 minutes in the future for admin review.' });
        }

        // 2. Validate End Time
        if (new Date(endDateTime) <= new Date(startDateTime)) {
            return res.status(400).json({ success: false, message: 'End time must be after start time.' });
        }

        // 3. Validate Discount (Max 70%)
        if (discountType === 'percent' && (discountValue < 1 || discountValue > 70)) {
            return res.status(400).json({ success: false, message: 'Percentage discount must be between 1% and 70%.' });
        }

        // 4. Validate Products & Stock Snapshot
        if (!productIds || productIds.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one product is required.' });
        }

        const products = await Product.find({ _id: { $in: productIds } });
        if (products.length !== productIds.length) {
            return res.status(404).json({ success: false, message: 'One or more products not found.' });
        }

        // Check stock availability and capture min stock for total maxUses
        let totalStockAtCreation = Infinity;
        for (const product of products) {
            const stock = product.variants?.[0]?.sizes?.reduce((sum, s) => sum + s.stock, 0) || 0;
            if (stock <= 0) {
                return res.status(400).json({ success: false, message: `Product ${product.name} is out of stock.` });
            }
            if (stock < totalStockAtCreation) totalStockAtCreation = stock;
        }

        // 5. Check for Duplicate Active/Pending deals
        const existingDeal = await Deal.findOne({
            productIds: { $in: productIds },
            status: { $in: ['pending', 'approved', 'live', 'paused'] },
            $or: [
                { startDateTime: { $lt: new Date(endDateTime) }, endDateTime: { $gt: new Date(startDateTime) } }
            ]
        });

        if (existingDeal) {
            return res.status(400).json({ success: false, message: 'One or more products already have an active/pending deal in this time range.' });
        }

        const deal = await Deal.create({
            sellerId: req.user.userId,
            productIds,
            dealType,
            discountType,
            discountValue,
            startDateTime,
            endDateTime,
            maxUses: totalStockAtCreation,
            title,
            description,
            category,
            couponCode,
            status: 'pending'
        });

        res.status(201).json({ 
            success: true, 
            message: 'Deal submitted for review. ₹50 will be charged on approval.',
            data: deal 
        });

        // NOTIFICATION: To Admin
        notifyAdmins({
            type: 'NEW_DEAL',
            message: `Merchant "${req.user.username}" proposed a new deal: ${title}`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * PATCH /api/deals/:id/approve
 * Private (Admin) - Approve a deal & charge ₹50 fee
 */
router.patch('/:id/approve', authMiddleware, authorizeRoles('admin'), async (req, res) => {
    try {
        const deal = await Deal.findById(req.params.id);
        if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });
        if (deal.status !== 'pending') return res.status(400).json({ success: false, message: 'Deal is not in pending state.' });

        // Deduction logic (Simplified wallet check - in production use a transaction)
        const seller = await User.findById(deal.sellerId);
        // Assuming wallet balance is part of user or separate wallet model
        // For this demo, we set commissionPaid = true and log it.
        
        deal.commissionPaid = true;
        const now = new Date();
        const shouldBeLive = new Date(deal.startDateTime) <= now;
        
        deal.status = shouldBeLive ? 'live' : 'approved';
        await deal.save();

        sendDealEmail(
            seller.email,
            'Deal Approved & Commission Charged',
            `Your deal "${deal.title}" is approved. A flat fee of ₹50 has been charged. Status: ${deal.status.toUpperCase()}`
        );

        res.json({ success: true, data: deal, message: 'Deal approved and ₹50 fee processed.' });

        // NOTIFICATION: To Seller
        sendNotification({
            userId: deal.sellerId,
            role: 'seller',
            type: 'DEAL_APPROVED',
            message: `CONGRATS! Your campaign "${deal.title}" was approved by WonderCart Admin.`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * PATCH /api/deals/:id/reject
 * Private (Admin) - Reject a deal
 */
router.patch('/:id/reject', authMiddleware, authorizeRoles('admin'), async (req, res) => {
    try {
        const { reason } = req.body;
        const deal = await Deal.findByIdAndUpdate(req.params.id, { 
            status: 'rejected',
            rejectionReason: reason
        }, { new: true }).populate('productId sellerId');
        
        if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });

        sendDealEmail(
            deal.sellerId.email,
            'Deal Rejected',
            `Your deal for campaign "${deal.title}" has been rejected. Reason: ${reason}`
        );

        // NOTIFICATION: To Seller
        sendNotification({
            userId: deal.sellerId._id,
            role: 'seller',
            type: 'DEAL_REJECTED',
            message: `REJECTED: Your campaign "${deal.title}" was rejected. Reason: ${reason}`
        });

        res.json({ success: true, data: deal });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
/**
 * PATCH /api/deals/:id/expire-soon
 * Private (Admin) - Force expire a deal in 1 minute
 */
router.patch('/:id/expire-soon', authMiddleware, authorizeRoles('admin'), async (req, res) => {
    try {
        const deal = await Deal.findById(req.params.id);
        if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });
        
        // Only active or approved future deals can be set to expire soon
        if (!['live', 'approved'].includes(deal.status)) {
            return res.status(400).json({ success: false, message: 'Only active or scheduled deals can be force-expired.' });
        }

        deal.endDateTime = new Date(Date.now() + 60 * 1000); // 1 minute from now
        await deal.save();

        // Notify Seller
        sendNotification({
            userId: deal.sellerId,
            role: 'seller',
            type: 'DEAL_EXPIRING_SOON',
            message: `Admin has scheduled your deal "${deal.title}" to expire in 1 minute.`
        });

        res.json({ success: true, data: deal, message: 'Deal scheduled to expire in 60 seconds.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * GET /api/deals/admin/all
 * Private (Admin) - Get all deals with status filter
 */
router.get('/admin/all', authMiddleware, authorizeRoles('admin'), async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status) query.status = status;

        const deals = await Deal.find(query)
            .populate('productIds', 'name variants images')
            .populate('sellerId', 'username email')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: deals });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * GET /api/deals/admin/pending
 * Private (Admin) - Get all pending deals
 */
router.get('/admin/pending', authMiddleware, authorizeRoles('admin'), async (req, res) => {
    try {
        const deals = await Deal.find({ status: 'pending' })
            .populate('productIds', 'name variants images')
            .populate('sellerId', 'username email')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: deals });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * GET /api/deals/seller/my-deals
 * Private (Seller) - Get seller's deals
 */
router.get('/seller/my-deals', authMiddleware, authorizeRoles('seller'), async (req, res) => {
    try {
        const deals = await Deal.find({ sellerId: req.user.userId })
            .populate('productIds', 'name variants')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: deals });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
