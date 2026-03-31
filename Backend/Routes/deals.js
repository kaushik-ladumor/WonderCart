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
        let query = { status: 'live' };

        if (category && category !== 'All') query.category = category;
        if (dealType) query.dealType = dealType;

        let sortQuery = { createdAt: -1 };
        if (sort === 'discount') sortQuery = { discountPercent: -1 };
        if (sort === 'endTime') sortQuery = { endTime: 1 };
        if (sort === 'popular') sortQuery = { claimedCount: -1 };

        const skip = (page - 1) * limit;
        const total = await Deal.countDocuments(query);
        const deals = await Deal.find(query)
            .populate('productId', 'name variants rating reviewCount')
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
        const deals = await Deal.find({ status: 'live', dealType: 'lightning' })
            .populate('productId', 'name variants rating reviewCount')
            .sort({ endTime: 1 })
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
        const deal = await Deal.findById(req.params.id).populate('productId');
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
 * Private (Seller) - Create a new deal
 */
router.post('/', authMiddleware, authorizeRoles('seller'), validateDealMargin, async (req, res) => {
    try {
        const { productId, dealType, discountPercent, originalPrice, costPrice, stockLimit, startTime, endTime, category } = req.body;
        
        const dealPrice = calculateDealPrice(originalPrice, discountPercent);
        
        const deal = await Deal.create({
            productId,
            sellerId: req.user.userId,
            dealType,
            discountPercent,
            originalPrice,
            dealPrice,
            costPrice,
            stockLimit,
            startTime,
            endTime,
            category,
            status: 'pending'
        });

        // Notify Admin
        const product = await Product.findById(productId);
        const seller = await User.findById(req.user.userId);
        
        sendDealEmail(
            process.env.ADMIN_EMAIL || 'admin@wondercart.com',
            'New deal pending review',
            `New deal pending review: ${product.name} by ${seller.username}`
        );

        res.status(201).json({ 
            success: true, 
            data: deal, 
            warning: req.marginWarning 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * PATCH /api/deals/:id/approve
 * Private (Admin) - Approve a deal
 */
router.patch('/:id/approve', authMiddleware, authorizeRoles('admin'), async (req, res) => {
    try {
        const deal = await Deal.findById(req.params.id);
        if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });

        const now = new Date();
        const shouldBeLive = new Date(deal.startTime) <= now;
        
        deal.status = shouldBeLive ? 'live' : 'approved';
        await deal.save();

        const updatedDeal = await Deal.findById(deal._id).populate('productId sellerId');

        sendDealEmail(
            updatedDeal.sellerId.email,
            'Deal Approved',
            `Your deal for ${updatedDeal.productId.name} has been approved. Status: ${updatedDeal.status.toUpperCase()}`
        );

        res.json({ success: true, data: updatedDeal, instantLive: shouldBeLive });
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
            `Your deal for ${deal.productId.name} has been rejected. Reason: ${reason}`
        );

        res.json({ success: true, data: deal });
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
            .populate('productId', 'name variants')
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
            .populate('productId', 'name variants')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: deals });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
